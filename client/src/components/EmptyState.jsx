const EmptyState = ({ title, description, action }) => {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">🐾</div>
      <div className="empty-state__content">
        <h4>{title}</h4>
        {description && <p>{description}</p>}
      </div>
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
};

export default EmptyState;
