const SummaryBar = ({ items = [] }) => {
  if (!items.length) {
    return null;
  }

  return (
    <div className="summary-bar">
      {items.map((item) => (
        <div key={item.label} className="summary-item">
          <span className="summary-item__label">{item.label}</span>
          <span className="summary-item__value">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

export default SummaryBar;
