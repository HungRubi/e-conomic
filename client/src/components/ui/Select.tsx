'use client';

import { Select as MedusaSelect } from '@medusajs/ui';

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
			</MedusaSelect.Trigger>
			<MedusaSelect.Content align='end'>
				{options.map(opt => (
					<MedusaSelect.Item key={opt.value} value={opt.value}>
						{opt.label}
					</MedusaSelect.Item>
				))}
			</MedusaSelect.Content>
		</MedusaSelect>
	);
}
