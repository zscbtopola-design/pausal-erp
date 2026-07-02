import "./ConfirmDialog.css";

function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h3>{title}</h3>

        <p>{message}</p>

        <div className="dialog-buttons">
          <button onClick={onCancel}>Otkaži</button>

          <button className="danger" onClick={onConfirm}>
            Obriši
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;