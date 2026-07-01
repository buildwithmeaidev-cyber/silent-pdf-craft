// src/context/__tests__/UploadContext.test.tsx
import { renderHook, act } from '@testing-library/react';
import { UploadProvider, useUpload } from '@/context/UploadContext';
import { vi } from 'vitest';
// import { v4 as uuidv4 } from 'uuid'; // removed unused import

// Mock uuid to return predictable ids
let uuidCounter = 0;
vi.mock('uuid', () => ({ v4: vi.fn(() => `test-id-${++uuidCounter}`) }));

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <UploadProvider>{children}</UploadProvider>
);

describe('UploadContext', () => {
  test('addFiles adds files with generated ids', () => {
    const { result } = renderHook(() => useUpload(), { wrapper });
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
    act(() => {
      result.current.addFiles([file]);
    });
    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0].id).toBe('test-id');
    expect(result.current.files[0].file).toBe(file);
  });

  test('removeFile removes a file by id', () => {
    const { result } = renderHook(() => useUpload(), { wrapper });
    const file = new File(['content'], 'a.pdf', { type: 'application/pdf' });
    act(() => {
      result.current.addFiles([file]);
    });
    const id = result.current.files[0].id;
    act(() => {
      result.current.removeFile(id);
    });
    expect(result.current.files).toHaveLength(0);
  });

  test('moveFile reorders files', () => {
    const { result } = renderHook(() => useUpload(), { wrapper });
    const file1 = new File(['1'], '1.pdf', { type: 'application/pdf' });
    const file2 = new File(['2'], '2.pdf', { type: 'application/pdf' });
    act(() => {
      result.current.addFiles([file1, file2]);
    });
    const id2 = result.current.files[1].id;
    act(() => {
      result.current.moveFile(id2, 'up');
    });
    expect(result.current.files[0].file).toStrictEqual(file2);
    expect(result.current.files[1].file).toStrictEqual(file1);
  });

  test('clearFiles empties the list', () => {
    const { result } = renderHook(() => useUpload(), { wrapper });
    const file = new File(['x'], 'x.pdf', { type: 'application/pdf' });
    act(() => {
      result.current.addFiles([file]);
    });
    act(() => {
      result.current.clearFiles();
    });
    expect(result.current.files).toHaveLength(0);
  });

  test('setError and clearError manage error state', () => {
    const { result } = renderHook(() => useUpload(), { wrapper });
    act(() => {
      result.current.setError('test error');
    });
    expect(result.current.error).toBe('test error');
    act(() => {
      result.current.setError(null);
    });
    expect(result.current.error).toBeNull();
  });
});
