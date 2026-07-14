'use client';

import { Select as MedusaSelect } from '@medusajs/ui';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
	value: string;
	label: string;
}

interface SelectProps {
	value?: string;
	options: SelectOption[];
	onChange?: (event: { target: { value: string } }) => void;
	className?: string;
	disabled?: boolean;
}

export default function Select({ value, options, onChange, className = '', disabled = false }: SelectProps) {
	return (
		<MedusaSelect
			value={value ?? options[0]?.value}
			onValueChange={val => onChange?.({ target: { value: val } })}
			disabled={disabled}
		>
			<MedusaSelect.Trigger className={className}>
				<MedusaSelect.Value placeholder='Chọn...' />
				<ChevronDown className='h-4 w-4' />
			</MedusaSelect.Trigger>
			<MedusaSelect.Content>
				{options.map(opt => (
					<MedusaSelect.Item key={opt.value} value={opt.value}>
						{opt.label}
					</MedusaSelect.Item>
				))}
			</MedusaSelect.Content>
		</MedusaSelect>
	);
}
