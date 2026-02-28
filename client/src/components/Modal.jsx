import { useEffect, useId, useRef } from "react";

const Modal = ({ isOpen, onClose, title, description, children }) => {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !panelRef.current) {
      return undefined;
    }

    const previouslyFocusedElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const getFocusTarget = () => {
      const container = panelRef.current;
      if (!container) {
        return null;
      }
      return (
        container.querySelector("[data-autofocus]") ||
        container.querySelector(
          ".modal-body input, .modal-body textarea, .modal-body select, .modal-body button, .modal-body [tabindex]:not([tabindex='-1'])"
        ) ||
        container.querySelector(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        )
      );
    };

    const focusTarget = getFocusTarget();
    if (focusTarget instanceof HTMLElement) {
      focusTarget.focus();
    }

    return () => {
      previouslyFocusedElement?.focus();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onPointerDown={handleBackdropClick}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
        onPointerDown={(event) => event.stopPropagation()}
        ref={panelRef}
        tabIndex={-1}
      >
        <div className="modal-header">
          <div className="modal-header__content">
            {title && (
              <h3 id={titleId} className="modal-title">
                {title}
              </h3>
            )}
            {description && (
              <p id={descriptionId} className="modal-description">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            className="icon-button icon-button--ghost"
            onClick={onClose}
            aria-label="Close dialog"
          >
            &times;
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
