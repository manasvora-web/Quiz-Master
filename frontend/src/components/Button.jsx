export default function Button({ children, variant = "primary", ...props }) {
  const styles = {
    primary: {
      background: "var(--primary)",
      color: "var(--heading)"
    },
    secondary: {
      background: "var(--secondary)",
      color: "#fff"
    }
  };

  return (
    <button
      {...props}
      style={{
        ...styles[variant]
      }}
      onMouseOver={(e) => {
        if (variant === "primary") {
          e.target.style.background = "var(--primary-hover)";
        }
      }}
      onMouseOut={(e) => {
        if (variant === "primary") {
          e.target.style.background = "var(--primary)";
        }
      }}
    >
      {children}
    </button>
  );
}
