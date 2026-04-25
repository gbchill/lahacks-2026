type DocumentPreviewProps = {
  src: string;
  type: string;
};

const TYPE_LABELS: Record<string, string> = {
  medicaid: "Medicaid",
  uscis: "USCIS",
  irs: "IRS",
  dmv: "DMV",
  school: "School",
  medical: "Medical",
  lease: "Lease",
  car_insurance: "Car Insurance",
  utility: "Utility",
  other: "Document",
};

export function DocumentPreview({ src, type }: DocumentPreviewProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-20 h-28 rounded-lg overflow-hidden border border-border bg-secondary flex-shrink-0">
        <img
          src={src}
          alt="Original document"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="pt-1">
        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-secondary text-secondary-foreground">
          {TYPE_LABELS[type] ?? type}
        </span>
      </div>
    </div>
  );
}
