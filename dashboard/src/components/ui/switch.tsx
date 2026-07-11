export function Switch({
	checked,
	onCheckedChange,
	disabled,
	id,
}: {
	checked: boolean;
	onCheckedChange: (v: boolean) => void;
	disabled?: boolean;
	id?: string;
}) {
	return (
		<button
			type='button'
			role='switch'
			aria-checked={checked}
			id={id}
			disabled={disabled}
			data-state={checked ? 'checked' : 'unchecked'}
			onClick={() => onCheckedChange(!checked)}
			className={[
				'peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent',
				'transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
				'disabled:cursor-not-allowed disabled:opacity-50',
				checked ? 'bg-zinc-900' : 'bg-zinc-200',
			].join(' ')}
		>
			<span
				data-state={checked ? 'checked' : 'unchecked'}
				className={[
					'pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0',
					'transition-transform duration-200 ease-in-out',
					checked ? 'translate-x-4' : 'translate-x-0',
				].join(' ')}
			/>
		</button>
	);
}
