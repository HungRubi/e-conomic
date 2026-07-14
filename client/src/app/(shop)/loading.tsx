export default function ShopLoading() {
	return (
		<div className='flex flex-1 items-center justify-center py-32'>
			<div className='flex flex-col items-center gap-4'>
				<div
					className='size-8 rounded-full border-2 border-t-transparent animate-spin'
					style={{
						borderColor: 'var(--border-base)',
						borderTopColor: 'transparent',
					}}
				/>
				<p className='text-sm' style={{ color: 'var(--fg-subtle)' }}>
					Đang tải...
				</p>
			</div>
		</div>
	);
}
