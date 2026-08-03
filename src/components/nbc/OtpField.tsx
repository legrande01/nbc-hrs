import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";

interface OtpFieldProps {
  id: string;
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  verified?: boolean;
  className?: string;
}

/** Six-digit one-time code entry, shared by verification and password reset. */
export function OtpField({
  id,
  label,
  hint,
  value,
  onChange,
  disabled,
  verified,
  className,
}: OtpFieldProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {verified ? (
          <span className="text-xs font-semibold uppercase tracking-wide text-nbc-royal">
            Verified
          </span>
        ) : null}
      </div>
      <InputOTP
        id={id}
        maxLength={6}
        value={value}
        onChange={onChange}
        disabled={disabled || verified}
        containerClassName="justify-start"
      >
        <InputOTPGroup>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <InputOTPSlot key={index} index={index} />
          ))}
        </InputOTPGroup>
      </InputOTP>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
