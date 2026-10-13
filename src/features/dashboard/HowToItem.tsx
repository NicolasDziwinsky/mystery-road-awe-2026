import { RouteButton } from "../../components/index.ts";

export interface HowToItemProps {
  number: number;
  title: string;
  description: string;
  buttonLabel?: string;
  targetLocation?: string;
}

export function HowToItem({
  number,
  title,
  description,
  buttonLabel,
  targetLocation,
}: HowToItemProps) {
  return (
    <div className="howto-item">
      <h4>
        {number}. {title}
      </h4>
      <p>{description}</p>
      {buttonLabel && targetLocation ? (
        <RouteButton
          label={buttonLabel}
          targetLocation={targetLocation}
          variant="secondary"
          size="small"
        />
      ) : null}
    </div>
  );
}
