import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

export type ComboboxOption = {
	value: string;
	label: string;
};

type MultiSelectComboboxProps = {
	options: ComboboxOption[];
	selectedValues: string[];
	onSelectedChange: (values: string[]) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	disabled?: boolean;
	className?: string;
};

export function MultiSelectCombobox({
	options,
	selectedValues,
	onSelectedChange,
	placeholder = 'Chọn...',
	searchPlaceholder = 'Tìm kiếm...',
	emptyText = 'Không tìm thấy.',
	disabled = false,
	className,
}: MultiSelectComboboxProps) {
	const [open, setOpen] = React.useState(false);
	const [triggerWidth, setTriggerWidth] = React.useState(0);
	const triggerRef = React.useRef<HTMLButtonElement>(null);

	React.useEffect(() => {
		if (triggerRef.current) {
			setTriggerWidth(triggerRef.current.offsetWidth);
		}
	}, [open]);

	const toggleSelection = (value: string) => {
		if (selectedValues.includes(value)) {
			onSelectedChange(selectedValues.filter(v => v !== value));
		} else {
			onSelectedChange([...selectedValues, value]);
		}
	};

	const removeValue = (value: string) => {
		onSelectedChange(selectedValues.filter(v => v !== value));
	};

	return (
		<div className={cn('flex flex-col gap-2', className)}>
			<Popover open={open} onOpenChange={setOpen}>
				<PopoverTrigger asChild>
					<Button
						ref={triggerRef}
						variant='outline'
						role='combobox'
						aria-expanded={open}
						className='w-full justify-between'
						disabled={disabled}
					>
						<span className='truncate'>
							{selectedValues.length > 0 ? `đã chọn ${selectedValues.length}` : placeholder}
						</span>
						<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>
				<PopoverContent className='p-0' align='start' style={{ width: triggerWidth }}>
					<Command>
						<CommandInput placeholder={searchPlaceholder} />
						<CommandList>
							<CommandEmpty>{emptyText}</CommandEmpty>
							<CommandGroup>
								{options.map(option => (
									<CommandItem
										key={option.value}
										value={option.value}
										onSelect={() => toggleSelection(option.value)}
									>
										<Check
											className={cn(
												'mr-2 h-4 w-4',
												selectedValues.includes(option.value) ? 'opacity-100' : 'opacity-0'
											)}
										/>
										{option.label}
									</CommandItem>
								))}
							</CommandGroup>
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>

			{selectedValues.length > 0 ? (
				<div className='flex flex-wrap gap-1.5'>
					{selectedValues.map(value => {
						const label = options.find(opt => opt.value === value)?.label || value;
						return (
							<Badge
								key={value}
								variant='secondary'
								className='cursor-pointer'
								onClick={() => !disabled && removeValue(value)}
							>
								{label}
								<span className='ml-1 text-xs'>×</span>
							</Badge>
						);
					})}
				</div>
			) : null}
		</div>
	);
}
