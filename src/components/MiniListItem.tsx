import type { ReactNode } from "react";

export interface MiniListItemProps {
  primary: ReactNode;
  secondary?: ReactNode;
  badge?: ReactNode;
}

export function MiniListItem({ primary, secondary, badge }: MiniListItemProps) {
  return (
    <div className="mini-list-item">
      <strong>{primary}</strong>
      {secondary ? (
        <>
          <br />
          {secondary}
        </>
      ) : null}
      {badge ? <div>{badge}</div> : null}
    </div>
  );
}
