const SectionCard = ({
  as: Tag = "div",
  title,
  description,
  actions,
  children,
  className = "",
  ...props
}) => {
  const Component = Tag;

  return (
    <Component className={`section-card ${className}`.trim()} {...props}>
      {(title || description || actions) && (
        <header className="section-card__header">
          <div className="section-card__lead">
            {title && <h3 className="section-card__title">{title}</h3>}
            {description && (
              <p className="section-card__description">{description}</p>
            )}
          </div>
          {actions && <div className="section-card__actions">{actions}</div>}
        </header>
      )}
      <div className="section-card__body">{children}</div>
    </Component>
  );
};

export default SectionCard;
