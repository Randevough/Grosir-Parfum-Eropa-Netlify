import { useState } from 'react'
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import { MinusIcon as Minus } from '@phosphor-icons/react/dist/csr/Minus'
import { PlusIcon as Plus } from '@phosphor-icons/react/dist/csr/Plus'
import { ImageBrokenIcon as ImageOff } from '@phosphor-icons/react/dist/csr/ImageBroken'
import type { Product } from '../types'
export function Button({ variant = 'primary', className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }) {
  return <button className={`btn btn-${variant} ${className}`} {...props} />
}
export function Field({ label, id, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string; error?: string }) {
  return <div className="field"><label htmlFor={id}>{label}</label><input className="input" id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} {...props} />{error && <p id={`${id}-error`} className="text-danger text-sm">{error}</p>}</div>
}
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) { return <div className="empty-state"><h2>{title}</h2>{children}</div> }
export function QuantityControl({ value, onChange, disabled = false, label = 'Jumlah kemasan' }: { value: number; onChange: (value: number) => void; disabled?: boolean; label?: string }) {
  return <div className="quantity-control"><button type="button" aria-label={`Kurangi ${label.toLowerCase()}`} disabled={disabled || value <= 1} onClick={() => onChange(value - 1)}><Minus aria-hidden="true" size={16} /></button><input aria-label={label} type="number" min="1" max="9999" step="1" value={value} disabled={disabled} onChange={e => { const next = Number(e.target.value); if (Number.isSafeInteger(next) && next > 0 && next <= 9999) onChange(next) }} /><button type="button" aria-label={`Tambah ${label.toLowerCase()}`} disabled={disabled || value >= 9999} onClick={() => onChange(value + 1)}><Plus aria-hidden="true" size={16} /></button></div>
}
export function ProductImage({ product, className = '' }: { product: Product; className?: string }) {
  const [failedSource, setFailedSource] = useState<string>()
  return <div className={`product-image ${className}`} style={{ '--product-tint': product.colors[0] } as React.CSSProperties}>{product.image && product.image !== failedSource ? <img src={product.image} alt={product.name} loading="lazy" onError={() => setFailedSource(product.image)} /> : <><ImageOff aria-hidden="true" size={25} weight="regular" /><span>Foto segera ditambahkan</span><strong>{product.name}</strong></>}</div>
}
