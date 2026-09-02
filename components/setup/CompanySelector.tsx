'use client';

import { useState } from 'react';
import { COMPANIES, COMPANY_DESCRIPTIONS, type Company } from '@/types';
import { Tooltip } from '@/components/ui/Tooltip';

interface CompanySelectorProps {
  value: Company | null;
  onChange: (value: Company) => void;
  allowed: Company[];
}

export function CompanySelector({ value, onChange, allowed }: CompanySelectorProps) {
  const [hovered, setHovered] = useState<Company | null>(null);
  const active = hovered ?? value;

  return (
    <div>
      <h3 className="mb-2 text-xs uppercase tracking-wide text-text-secondary">Компания</h3>
      <div className="flex flex-wrap gap-2">
        {COMPANIES.map((company) => {
          const isAllowed = allowed.includes(company);
          const isSelected = value === company;

          const button = (
            <button
              key={company}
              type="button"
              disabled={!isAllowed}
              onClick={() => isAllowed && onChange(company)}
              onMouseEnter={() => setHovered(company)}
              onMouseLeave={() => setHovered(null)}
              className={`flex items-center gap-1.5 rounded border px-3 py-2 text-sm transition-colors duration-150 ease-out ${
                isSelected
                  ? 'border-accent bg-accent-subtle text-accent-text'
                  : isAllowed
                    ? 'border-border-strong bg-surface text-text-primary hover:bg-surface-hover'
                    : 'cursor-not-allowed border-border bg-surface text-text-muted opacity-60'
              }`}
            >
              {company}
              {!isAllowed && <span>🔒</span>}
            </button>
          );

          return isAllowed ? (
            button
          ) : (
            <Tooltip key={company} content="Доступно в PRO">
              {button}
            </Tooltip>
          );
        })}
      </div>
      {active && (
        <p className="mt-2 text-xs text-text-muted">{COMPANY_DESCRIPTIONS[active]}</p>
      )}
    </div>
  );
}
