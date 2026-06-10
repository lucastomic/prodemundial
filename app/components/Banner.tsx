import { Icons } from "./icons";

type Kind = "info" | "warn" | "ok" | "err";

export function Banner({
  kind = "info",
  children,
}: {
  kind?: Kind;
  children: React.ReactNode;
}) {
  const I =
    kind === "warn" || kind === "err"
      ? Icons.alert
      : kind === "ok"
      ? Icons.circleCheck
      : Icons.info;
  return (
    <div className={`banner ${kind}`}>
      <I />
      <div>{children}</div>
    </div>
  );
}
