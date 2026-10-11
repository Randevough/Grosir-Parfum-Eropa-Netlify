import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown'
import { CheckIcon } from '@phosphor-icons/react/dist/csr/Check'

export default function RegionSelect({ regions, value, onChange }: { regions: string[]; value: string; onChange: (value: string) => void }) {
  const id = useId()
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const options = [{ value: '', label: 'Semua wilayah' }, ...regions.map(region => ({ value: region, label: region }))]
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value))
  useEffect(() => {
    if (!open) return
    const option = root.current?.querySelectorAll<HTMLButtonElement>('[role="option"]')[active]
    option?.focus({ preventScroll: true })
    const panel = option?.parentElement
    if (option && panel && (option.offsetTop < panel.scrollTop || option.offsetTop + option.offsetHeight > panel.scrollTop + panel.clientHeight)) panel.scrollTop = option.offsetTop - 5
  }, [open, active])
  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false) }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open])
  function close() { setOpen(false); trigger.current?.focus() }
  function keyboard(event: KeyboardEvent) {
    if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close() }
    else if (event.key === 'Tab') { trigger.current?.focus(); setOpen(false) }
    else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setActive(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length) }
    else if (event.key === 'Home' || event.key === 'End') { event.preventDefault(); setActive(event.key === 'Home' ? 0 : options.length - 1) }
    else if (event.key.length === 1 && /[a-z]/i.test(event.key)) {
      const next = options.findIndex(option => option.label.toLowerCase().startsWith(event.key.toLowerCase()))
      if (next >= 0) { event.preventDefault(); setActive(next) }
    }
  }
  return <div ref={root} className="region-select"><button ref={trigger} type="button" className="region-select-trigger" aria-label={`Wilayah: ${options[selectedIndex].label}`} aria-haspopup="listbox" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => { setActive(selectedIndex); setOpen(!open) }} onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setActive(selectedIndex); setOpen(true) } }}><span>{options[selectedIndex].label}</span><CaretDownIcon size={16} aria-hidden="true" /></button>{open && <div id={id} className="region-select-options" role="listbox" aria-label="Pilih wilayah" onKeyDown={keyboard}>{options.map((option, index) => <button type="button" key={option.value} role="option" aria-selected={option.value === value} tabIndex={index === active ? 0 : -1} onClick={() => { onChange(option.value); close() }}><span>{option.label}</span>{option.value === value && <CheckIcon size={16} weight="bold" aria-hidden="true" />}</button>)}</div>}</div>
}
