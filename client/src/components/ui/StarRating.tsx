import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface StarRatingProps {
	rating: number;
	max?: number;
	size?: 'sm' | 'md' | 'lg';
	showValue?: boolean;
	reviewCount?: number;
	interactive?: boolean;
	onChange?: (rating: number) => void;
}

const sizeMap = {
	sm: 'text-[12px]',
	md: 'text-[16px]',
	lg: 'text-[20px]',
};

export default function StarRating({
	rating,
	max = 5,
	size = 'sm',
	showValue,
	reviewCount,
	interactive = false,
	onChange,
}: StarRatingProps) {
	return (
		<div className='inline-flex items-center gap-0.5'>
			{Array.from({ length: max }).map((_, i) => {
				const filled = rating >= i + 1;
				const half = !filled && rating >= i + 0.5;
				const StarIcon = filled ? FaStar : half ? FaStarHalfAlt : FaRegStar;
				return (
					<button
						key={i}
						type='button'
						disabled={!interactive}
						onClick={() => interactive && onChange?.(i + 1)}
						className={
							interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'
						}
						aria-label={`${i + 1} sao`}
					>
						<StarIcon
							className={`
                ${sizeMap[size]}
                ${filled || half ? 'text-star' : 'text-star/30'}
                ${interactive ? 'transition-all' : ''}
              `.trim()}
						/>
					</button>
				);
			})}
			{showValue && (
				<span className='ml-1.5 text-sm text-text2'>
					{rating.toFixed(1)}
					{reviewCount !== undefined && ` (${reviewCount})`}
				</span>
			)}
		</div>
	);
}
