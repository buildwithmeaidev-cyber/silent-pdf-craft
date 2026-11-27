import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PagePicker } from "@/components/tools/PagePicker";
import { UploadProvider } from "@/context/UploadContext";
import ToolPage from "@/pages/tools/ToolPage";

const pageCountsByFile = new Map<string, number>([
  ["five.pdf", 5],
  ["two.pdf", 2],
  ["three.pdf", 3],
  ["invoice.pdf", 2],
]);

const removePagesSpy = vi.fn();
const rotatePdfSpy = vi.fn();

vi.mock("@/lib/pdf", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/pdf")>();
  return {
    ...actual,
    getPdfJs: vi.fn(async () => ({
      getDocument: ({ data }: { data: Uint8Array }) => {
        const label = new TextDecoder().decode(data);
        const numPages = pageCountsByFile.get(label) ?? 3;
        return {
          destroy: vi.fn(async () => {}),
          promise: Promise.resolve({
            numPages,
            cleanup: vi.fn(async () => {}),
            getPage: vi.fn(async () => ({
              getViewport: () => ({ width: 120, height: 160 }),
              render: () => ({ promise: Promise.resolve() }),
            })),
          }),
        };
      },
    })),
    removePages: (...args: Parameters<typeof actual.removePages>) => removePagesSpy(...args),
    rotatePdf: (...args: Parameters<typeof actual.rotatePdf>) => rotatePdfSpy(...args),
  };
});

function makeMockPdfFile(name: string, lastModified = 100): File {
  const bytes = new TextEncoder().encode(name);
  const f = new File([bytes], name, { type: "application/pdf", lastModified });
  Object.defineProperty(f, "arrayBuffer", {
    configurable: true,
    value: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  });
  return f;
}

describe("Phase 2 UI: PagePicker & ToolPage interactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    class MockIO {
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal("IntersectionObserver", MockIO);
    removePagesSpy.mockResolvedValue({
      filename: "silentpdf-trimmed.pdf",
      blob: new Blob(["%PDF-1.7"], { type: "application/pdf" }),
    });
    rotatePdfSpy.mockResolvedValue({
      filename: "silentpdf-rotated.pdf",
      blob: new Blob(["%PDF-1.7"], { type: "application/pdf" }),
    });
  });

  it("resets stale selection cleanly when file changes and supports reorder/rotate controls", async () => {
    function Harness() {
      const [file, setFile] = useState<File>(() => makeMockPdfFile("five.pdf", 1));
      const [pages, setPages] = useState<number[]>([]);
      const [rotations, setRotations] = useState<Record<number, number>>({});
      const [mode, setMode] = useState<"select" | "reorder" | "rotate">("select");
      return (
        <div>
          <button type="button" onClick={() => setFile(makeMockPdfFile("two.pdf", 2))}>
            Swap file
          </button>
          <button type="button" onClick={() => setMode("reorder")}>
            Mode reorder
          </button>
          <button type="button" onClick={() => setMode("rotate")}>
            Mode rotate
          </button>
          <div data-testid="pages-state">{pages.join(",")}</div>
          <div data-testid="rot-state">{JSON.stringify(rotations)}</div>
          <PagePicker
            file={file}
            mode={mode}
            value={pages}
            onChange={setPages}
            rotations={rotations}
            onRotate={(page, deg) => setRotations((prev) => ({ ...prev, [page]: deg }))}
          />
        </div>
      );
    }

    render(<Harness />);
    await waitFor(() => expect(screen.getByTestId("pages-state").textContent).toBe("1,2,3,4,5"));

    // Swap to 2-page PDF: stale [1..5] must reset cleanly to [1,2]
    fireEvent.click(screen.getByText("Swap file"));
    await waitFor(() => expect(screen.getByTestId("pages-state").textContent).toBe("1,2"));

    // Switch to reorder and move page 1 right -> "2,1"
    fireEvent.click(screen.getByText("Mode reorder"));
    fireEvent.click(screen.getByRole("button", { name: "Move page 1 later" }));
    expect(screen.getByTestId("pages-state").textContent).toBe("2,1");

    // Switch to rotate and rotate page 2 -> +90°
    fireEvent.click(screen.getByText("Mode rotate"));
    fireEvent.click(screen.getByRole("button", { name: "Rotate page 2" }));
    expect(screen.getByTestId("rot-state").textContent).toBe('{"2":90}');
    expect(screen.getByRole("button", { name: "Rotate page 2 90 degrees" }).textContent).toContain("+90°");
  });

  it("Remove Pages removes the trailing page properly and blocks running when 0 pages are removed", async () => {
    const file = makeMockPdfFile("five.pdf", 10);
    const { container } = render(
      <MemoryRouter>
        <UploadProvider>
          <ToolPage toolSlug="remove-pages" />
        </UploadProvider>
      </MemoryRouter>,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(screen.getByRole("button", { name: "Toggle page 5" })).toBeInTheDocument());

    // Initially all 5 pages kept -> Run button disabled
    const runBtn = screen.getByRole("button", { name: /Remove Pages now/i });
    expect(runBtn).toBeDisabled();

    // Uncheck the trailing page (page 5) -> Run becomes enabled and sends range "5"
    fireEvent.click(screen.getByRole("button", { name: "Toggle page 5" }));
    expect(runBtn).not.toBeDisabled();
    fireEvent.click(runBtn);

    await waitFor(() => expect(removePagesSpy).toHaveBeenCalledTimes(1));
    expect(removePagesSpy.mock.calls[0][1]).toBe("5");
  });

  it("Rotate PDF supports per-page rotation mode in ToolPage and pre-fills filename in Export & Rename", async () => {
    const file = makeMockPdfFile("invoice.pdf", 20);
    const { container, unmount } = render(
      <MemoryRouter>
        <UploadProvider>
          <ToolPage toolSlug="rotate-pdf" />
        </UploadProvider>
      </MemoryRouter>,
    );

    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => expect(screen.getByRole("button", { name: "Per page" })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: "Per page" }));

    const runRotate = screen.getByRole("button", { name: /Rotate PDF now/i });
    expect(runRotate).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Rotate page 2" }));
    expect(runRotate).not.toBeDisabled();
    fireEvent.click(runRotate);

    await waitFor(() => expect(rotatePdfSpy).toHaveBeenCalledTimes(1));
    expect(rotatePdfSpy.mock.calls[0][1]).toEqual({ 2: 90 });

    unmount();

    // Export & Rename should prefill clean base filename + show page preview
    const exportView = render(
      <MemoryRouter>
        <UploadProvider>
          <ToolPage toolSlug="export-pdf" />
        </UploadProvider>
      </MemoryRouter>,
    );
    const exportInputFile = exportView.container.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(exportInputFile, { target: { files: [file] } });
    await waitFor(() => {
      const textBox = exportView.getByPlaceholderText("my-final-document") as HTMLInputElement;
      expect(textBox.value).toBe("invoice");
    });
  });
});
