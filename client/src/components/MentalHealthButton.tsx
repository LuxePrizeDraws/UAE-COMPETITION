import { useState } from 'react';
import MentalHealthModal from './MentalHealthModal';
import './MentalHealthButton.css';

interface MentalHealthButtonProps {
  variant?: 'default' | 'compact';
}

export default function MentalHealthButton({ variant = 'default' }: MentalHealthButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={`mh-btn mh-btn--${variant}`}
        onClick={() => setOpen(true)}
        aria-label="Open Mental Health Support"
      >
        <span className="mh-btn__icon">🧠</span>
        {variant !== 'compact' && <span className="mh-btn__text">Get Help</span>}
      </button>
      {open && <MentalHealthModal onClose={() => setOpen(false)} />}
    </>
  );
}
