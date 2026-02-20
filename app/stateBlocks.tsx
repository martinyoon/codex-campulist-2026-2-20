import Link from "next/link";

interface BaseStateProps {
  title: string;
  description: string;
  action_href?: string;
  action_label?: string;
}

const StateAction = ({
  action_href,
  action_label,
}: Pick<BaseStateProps, "action_href" | "action_label">) => {
  if (!action_href || !action_label) {
    return null;
  }

  return (
    <div className="state-actions">
      <Link href={action_href} className="btn">
        {action_label}
      </Link>
    </div>
  );
};

export function EmptyState(props: BaseStateProps) {
  return (
    <section className="state-card" aria-live="polite">
      <h3 className="state-title">{props.title}</h3>
      <p className="state-description">{props.description}</p>
      <StateAction
        action_href={props.action_href}
        action_label={props.action_label}
      />
    </section>
  );
}

export function ErrorState(props: BaseStateProps) {
  return (
    <section className="state-card state-card-danger" role="alert">
      <h3 className="state-title">{props.title}</h3>
      <p className="state-description">{props.description}</p>
      <StateAction
        action_href={props.action_href}
        action_label={props.action_label}
      />
    </section>
  );
}

interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({
  title = "불러오는 중입니다",
  description = "잠시만 기다려 주세요.",
}: LoadingStateProps) {
  return (
    <section className="state-card" aria-live="polite" aria-busy="true">
      <h3 className="state-title">{title}</h3>
      <p className="state-description">{description}</p>
      <div className="state-loading-bar" aria-hidden="true" />
    </section>
  );
}
