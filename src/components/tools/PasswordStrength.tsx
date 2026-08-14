import { useMemo } from "react";

const COMMON = [
  "password", "123456", "12345678", "qwerty", "abc123", "111111", "letmein",
  "welcome", "admin", "iloveyou", "monkey", "dragon", "football", "pdf123",
];

export type Strength = "weak" | "fair" | "strong";

export function scorePassword(pw: string): Strength {
  const lower = pw.toLowerCase();
  if (!pw) return "weak";
  if (COMMON.some((c) => lower.includes(c))) return "weak";

  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  if (pw.length < 8 || score <= 2) return "weak";
  if (score <= 3) return "fair";
  return "strong";
}

const WORDS = [
  "Blue", "Otter", "Rain", "Copper", "Falcon", "Mango", "Quartz", "Harbor",
  "Willow", "Ember", "Lantern", "Cedar", "Nimbus", "Pepper", "Tundra",
];
const SYMBOLS = "!@#$%&*?-";

/** Generate a memorable but strong password, e.g. Blue-Otter-42!Rain */
export function suggestPassword(): string {
  const rand = (n: number) => {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] % n;
  };
  const pick = () => WORDS[rand(WORDS.length)];
  const num = 10 + rand(90);
  const sym = SYMBOLS[rand(SYMBOLS.length)];
  return `${pick()}-${pick()}-${num}${sym}${pick()}`;
}

const META: Record<Strength, { label: string; bar: string; text: string; width: string }> = {
  weak: { label: "Weak", bar: "bg-destructive", text: "text-destructive", width: "w-1/3" },
  fair: { label: "Fair", bar: "bg-amber-500", text: "text-amber-600 dark:text-amber-500", width: "w-2/3" },
  strong: { label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-500", width: "w-full" },
};

export function PasswordStrength({
  password,
  onUseSuggestion,
}: {
  password: string;
  onUseSuggestion: (pw: string) => void;
}) {
  const strength = useMemo(() => scorePassword(password), [password]);
  const meta = META[strength];

  if (!password) {
    return (
      <p className="mt-1.5 text-xs text-muted-foreground">
        Recipients will need this password to open the PDF. Aim for 12+ characters —
        something like <span className="font-mono">Blue-Otter-42!Rain</span>.
      </p>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full transition-all ${meta.bar} ${meta.width}`} />
        </div>
        <span className={`text-xs font-medium ${meta.text}`}>{meta.label}</span>
      </div>

      {strength !== "strong" && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs">
          <p className="text-foreground">
            {strength === "weak"
              ? "This password is easy to guess. Use 12+ characters mixing words, numbers and a symbol —"
              : "Almost there. Add length or a symbol to make it hard to brute-force —"}{" "}
            for example <span className="font-mono">Copper-Willow-73?Ember</span>.
          </p>
          <button
            type="button"
            onClick={() => onUseSuggestion(suggestPassword())}
            className="mt-1.5 font-medium text-primary underline underline-offset-2"
          >
            Use a suggested strong password
          </button>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Recipients need this password to open the PDF. Printing, copying and editing
        limits are locked with a separate random key, so they can't be removed.
      </p>
    </div>
  );
}

export default PasswordStrength;
