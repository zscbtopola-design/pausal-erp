import "./EntityForm.css";

function EntityForm({
  title,
  fields,
  values,
  onChange,
  onSubmit,
  submitText = "Sačuvaj",
}) {
  return (
    <div className="entity-form">
      <h2>{title}</h2>

      <form onSubmit={onSubmit}>
        {fields.map((field) => (
          <div className="form-group" key={field.name}>
            <label>{field.label}</label>

            {field.type === "select" ? (
              <select
                name={field.name}
                value={values[field.name]}
                onChange={onChange}
              >
                {field.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || "text"}
                name={field.name}
                value={values[field.name]}
                onChange={onChange}
                placeholder={field.placeholder || ""}
              />
            )}
          </div>
        ))}

        <button type="submit">{submitText}</button>
      </form>
    </div>
  );
}

export default EntityForm;