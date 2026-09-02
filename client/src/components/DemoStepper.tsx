import React from 'react';
import type { DemoStep } from '../api/useGatewayDemo';
import { Check } from './Icons';

const STEPS: { id: DemoStep; n: string; title: string; hint: string }[] = [
  { id: 'intent', n: '01', title: 'Intent Lock', hint: 'Confirm shopping rules' },
  { id: 'catalog', n: '02', title: 'Catalog Filter', hint: 'Eligible vs excluded' },
  { id: 'selection', n: '03', title: 'AI Selection', hint: 'One product from offers' },
  { id: 'decision', n: '04', title: 'ChoiceProof', hint: 'Approve, review, or block' },
  { id: 'payment', n: '05', title: 'Payment Guardian', hint: 'Exact-cart permit' },
  { id: 'receipt', n: '06', title: 'Receipt', hint: 'Signed audit trail' },
];

interface DemoStepperProps {
  current: DemoStep;
  unlocked: DemoStep[];
  onSelect: (step: DemoStep) => void;
}

export const DemoStepper: React.FC<DemoStepperProps> = ({ current, unlocked, onSelect }) => {
  return (
    <nav className="demo-stepper" aria-label="Demo steps">
      <p className="demo-stepper-kicker">Guided demo</p>
      <ol className="demo-stepper-list">
        {STEPS.map((item, index) => {
          const isCurrent = item.id === current;
          const isDone = unlocked.indexOf(item.id) < unlocked.indexOf(current) || (unlocked.includes(item.id) && !isCurrent && STEPS.findIndex((s) => s.id === current) > index);
          const canOpen = unlocked.includes(item.id);
          return (
            <li key={item.id}>
              <button
                type="button"
                className={`demo-stepper-item ${isCurrent ? 'is-current' : ''} ${isDone ? 'is-done' : ''}`}
                disabled={!canOpen}
                onClick={() => onSelect(item.id)}
              >
                <span className="demo-stepper-index">
                  {isDone && !isCurrent ? <Check size={14} /> : item.n}
                </span>
                <span className="demo-stepper-copy">
                  <span className="demo-stepper-title">{item.title}</span>
                  <span className="demo-stepper-hint">{item.hint}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
