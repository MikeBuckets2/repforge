import { createElement } from 'react';

export default function Button({ children, icon, variant = 'primary', size = 'md', className = '', ...props }) {
  return (
    <button className={`btn btn-${variant} btn-${size} ${className}`} {...props}>
      {icon ? createElement(icon, { size: size === 'sm' ? 16 : 18, strokeWidth: 2 }) : null}
      <span>{children}</span>
    </button>
  );
}
