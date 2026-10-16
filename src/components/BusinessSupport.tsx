import { ArrowUpRightIcon } from '@phosphor-icons/react/dist/csr/ArrowUpRight'
import { FlaskIcon } from '@phosphor-icons/react/dist/csr/Flask'
import { SprayBottleIcon } from '@phosphor-icons/react/dist/csr/SprayBottle'
import { CONFIG } from '../data/config'
import './business-support.css'

const consultationFor = (topic: string) => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(`Halo Grosir Parfum Eropa, saya ingin konsultasi ${topic}`)}`

export default function BusinessSupport() {
  return <section id="business-support" className="business-support" aria-labelledby="support-title">
    <div className="wrap">
      <div className="support-heading">
        <h2 id="support-title">Lengkapi kebutuhan usaha parfummu</h2>
        <p>Bahas pilihan botol, alat racik, dan paket usaha bersama kami</p>
      </div>
      <div className="support-layout">
        <article className="support-package">
          <img className="support-package-photo" src="/images/business/perfume-workbench.jpg" alt="Ilustrasi meja peracikan parfum" width="1200" height="800" loading="lazy" decoding="async" />
          <div className="support-package-content">
            <h3>Paket usaha</h3>
            <p>Susun kebutuhan bibit parfum, botol, dan alat racik sesuai rencana tokomu</p>
            <a className="btn btn-primary support-package-link" href={consultationFor('paket usaha parfum sesuai kebutuhan toko saya')} target="_blank" rel="noreferrer">
              Bahas paket usaha <ArrowUpRightIcon className="arrow-motion arrow-up-right" size={18} aria-hidden="true" />
            </a>
          </div>
        </article>
        <div className="support-supplies">
          <article className="support-supply">
            <SprayBottleIcon className="support-icon" size={28} weight="regular" aria-hidden="true" />
            <div>
              <h3>Botol parfum</h3>
              <p>Temukan pilihan botol dan kemasan yang sesuai untuk kebutuhan tokomu</p>
              <a className="support-link" href={consultationFor('pilihan botol dan kemasan parfum')} target="_blank" rel="noreferrer">Tanya pilihan botol <ArrowUpRightIcon className="arrow-motion arrow-up-right" size={17} aria-hidden="true" /></a>
            </div>
          </article>
          <article className="support-supply">
            <FlaskIcon className="support-icon" size={28} weight="regular" aria-hidden="true" />
            <div>
              <h3>Alat racik</h3>
              <p>Diskusikan perlengkapan untuk menakar dan meracik parfum</p>
              <a className="support-link" href={consultationFor('perlengkapan alat racik parfum')} target="_blank" rel="noreferrer">Tanya alat racik <ArrowUpRightIcon className="arrow-motion arrow-up-right" size={17} aria-hidden="true" /></a>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
}
