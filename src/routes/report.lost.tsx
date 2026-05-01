import { createFileRoute } from "@tanstack/react-router";
import { ReportForm } from "@/components/report-form";

export const Route = createFileRoute("/report/lost")({
  component: () => <ReportForm kind="lost" />,
});
