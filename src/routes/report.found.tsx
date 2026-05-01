import { createFileRoute } from "@tanstack/react-router";
import { ReportForm } from "@/components/report-form";

export const Route = createFileRoute("/report/found")({
  component: () => <ReportForm kind="found" />,
});
