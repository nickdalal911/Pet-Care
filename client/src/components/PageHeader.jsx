const PageHeader = ({ title, description, actions, meta }) => {
  return (
    <header className="page-header">
      <div className="page-header__content">
        <h2 className="page-header__title">{title}</h2>
        {description && (
          <p className="page-header__description">{description}</p>
        )}
        {meta && <div className="page-header__meta">{meta}</div>}
      </div>
      {actions && <div className="page-header__actions">{actions}</div>}
    </header>
  );
};

export default PageHeader;
