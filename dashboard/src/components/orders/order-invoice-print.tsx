import type { OrderRow } from '@/api/admin-orders';
import { publicAssetUrl } from '@/lib/public-asset-url';

const COMPANY = {
	name: 'Miue.Healing',
	address: 'Đà Nẵng, Việt Nam',
	phone: '0919 946 962',
	taxCode: '040195024089',
	logo: '/images/logo.png',
};

function formatCurrency(value: number): string {
	return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function numberToWords(n: number): string {
	if (n === 0) return 'Không đồng';
	const units = ['', 'nghìn', 'triệu', 'tỷ'];
	const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
	function readBlock(num: number): string {
		const h = Math.floor(num / 100);
		const t = Math.floor((num % 100) / 10);
		const o = num % 10;
		let s = '';
		if (h > 0) s += digits[h] + ' trăm ';
		if (t > 1) s += digits[t] + ' mươi ';
		else if (t === 1) s += 'mười ';
		else if (h > 0 && (o > 0 || t > 0)) s += 'linh ';
		if (o === 5 && t > 0) s += 'lăm';
		else if (o === 1 && t > 0) s += 'mốt';
		else if (o > 0) s += digits[o];
		return s.trim();
	}
	const parts: string[] = [];
	let remaining = n;
	for (let i = 0; remaining > 0 && i < 4; i++) {
		const block = remaining % 1000;
		remaining = Math.floor(remaining / 1000);
		if (block > 0) {
			const blockStr = readBlock(block);
			parts.unshift(blockStr + ' ' + units[i]);
		} else if (i > 0 && parts.length > 0) {
			if (units[i]) parts.unshift(units[i]);
		}
	}
	return parts.join(' ').replace(/\s+/g, ' ').trim() + ' đồng';
}

export function printInvoice(order: OrderRow) {
	const addr = order.shippingAddress as Record<string, string>;
	const addrLine = [addr.line1, addr.ward, addr.district, addr.province].filter(Boolean).join(', ');
	const logoUrl = publicAssetUrl(COMPANY.logo);
	const payStatus =
		{
			PENDING: 'Chờ thanh toán',
			PAID: 'Đã thanh toán',
			FAILED: 'Thất bại',
			REFUNDED: 'Đã hoàn tiền',
			AWAITING_CONFIRMATION: 'Chờ xác nhận',
		}[order.paymentStatus] ?? order.paymentStatus;
	const payMethod = order.paymentMethod === 'COD' ? 'Tiền mặt (COD)' : 'Chuyển khoản ngân hàng';

	const itemsHtml = order.items
		.map(
			(item, i) => `
		<tr>
			<td style="width:36px;text-align:center;border:1px solid #bbb;padding:5px 6px;vertical-align:top;font-size:12px">${i + 1}</td>
			<td style="border:1px solid #bbb;padding:5px 6px;vertical-align:top;font-size:12px">${item.nameSnapshot}${item.variantLabel ? `<br><span style="font-size:10px;color:#666">(${item.variantLabel})</span>` : ''}</td>
			<td style="width:40px;text-align:center;border:1px solid #bbb;padding:5px 6px;vertical-align:top;font-size:12px">${item.quantity}</td>
			<td style="width:110px;text-align:right;border:1px solid #bbb;padding:5px 6px;vertical-align:top;font-size:12px">${formatCurrency(item.priceVndSnapshot)}</td>
			<td style="width:120px;text-align:right;border:1px solid #bbb;padding:5px 6px;vertical-align:top;font-size:12px;font-weight:600">${formatCurrency(item.lineTotalVnd)}</td>
		</tr>
	`
		)
		.join('');

	const discountHtml =
		order.discountVnd > 0
			? `<tr style="color:#b91c1c"><td style="text-align:left;padding:2px 0;font-size:12px">Giảm giá${order.discountCode ? ` (${order.discountCode})` : ''}:</td><td style="text-align:right;padding:2px 0;font-size:12px;width:130px">−${formatCurrency(order.discountVnd)}</td></tr>`
			: '';

	const now = new Date();
	const dateStr = new Intl.DateTimeFormat('vi-VN', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(now);

	const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Hoa don ${order.orderNumber}</title>
<style>
	@page { margin: 0; size: A4 portrait; }
	* { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
	body { font-family: 'Times New Roman', Times, serif; font-size: 13px; color: #000; line-height: 1.5; margin: 0; padding: 0; display: flex; justify-content: center; }
	.page { width: 210mm; min-height: 297mm; padding: 15mm 12mm; }
	.header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
	.brand { display: flex; align-items: center; gap: 10px; }
	.brand img { width: 50px; height: 50px; object-fit: contain; }
	.cname { font-size: 20px; font-weight: 700; }
	.tagline { font-size: 11px; color: #555; font-style: italic; }
	.title-block { text-align: right; }
	.title { font-size: 19px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; }
	.orderno { font-size: 12px; color: #555; margin-top: 3px; }
	.parties { width: 100%; border-collapse: collapse; margin: 10px 0; }
	.parties th { border: 1px solid #000; padding: 6px 8px; font-size: 12px; font-weight: 700; text-align: center; text-transform: uppercase; background: #eee; }
	.parties td { border: 1px solid #000; padding: 6px 8px; vertical-align: top; font-size: 12px; }
	.parties p { margin: 1px 0; }
	.items { width: 100%; border-collapse: collapse; margin: 10px 0; }
	.items th { border: 1px solid #000; padding: 6px; font-size: 11px; font-weight: 700; text-align: center; text-transform: uppercase; background: #eee; }
	.summary-wrap { display: flex; justify-content: flex-end; margin: 8px 0; }
	.summary { width: 300px; }
	.summary td { padding: 2px 0; font-size: 12px; }
	.total-row td { font-size: 15px; font-weight: 700; border-top: 1px solid #000; padding-top: 4px; }
	.words { font-size: 12px; font-style: italic; margin: 6px 0; padding: 4px 0; border-top: 1px dashed #999; text-align: center; }
	.payinfo { margin: 8px 0; border-collapse: collapse; }
	.payinfo td { padding: 1px 8px 1px 0; font-size: 12px; }
	.pil { color: #444; white-space: nowrap; }
	.sigs { display: flex; justify-content: space-around; margin: 30px 0 16px; }
	.sig { text-align: center; min-width: 150px; }
	.sig-label { font-weight: 700; margin-bottom: 3px; }
	.sig-hint { font-size: 10px; color: #666; }
	.fdate { text-align: center; font-size: 10px; color: #888; }
</style>
</head>
<body>
<div class="page">
	<div class="header">
		<div class="brand">
			<img src="${logoUrl}" alt="">
			<div><div class="cname">${COMPANY.name}</div><div class="tagline">Tinh tế từ thiên nhiên</div></div>
		</div>
		<div class="title-block">
			<div class="title">HÓA ĐƠN BÁN HÀNG</div>
			<div class="orderno">Mã đơn: ${order.orderNumber}</div>
		</div>
	</div>

	<table class="parties">
		<thead><tr><th colspan="2">Thông tin</th></tr></thead>
		<tbody>
			<tr>
				<td style="width:50%"><p><strong>Bên bán</strong></p><p>${COMPANY.name}</p><p>MST: ${COMPANY.taxCode}</p><p>Địa chỉ: ${COMPANY.address}</p><p>Điện thoại: ${COMPANY.phone}</p></td>
				<td style="width:50%"><p><strong>Bên mua</strong></p><p><strong>${order.customerName}</strong></p><p>Điện thoại: ${order.customerPhone}</p>${order.customerEmail ? `<p>Email: ${order.customerEmail}</p>` : ''}<p>Địa chỉ: ${addrLine || '—'}</p></td>
			</tr>
		</tbody>
	</table>

	<table class="items">
		<thead><tr><th style="width:36px">STT</th><th>Tên hàng hóa, dịch vụ</th><th style="width:40px">SL</th><th style="width:110px">Đơn giá</th><th style="width:120px">Thành tiền</th></tr></thead>
		<tbody>${itemsHtml}</tbody>
	</table>

	<div class="summary-wrap">
		<table class="summary">
			<tr><td style="text-align:left">Tạm tính:</td><td style="text-align:right;width:130px">${formatCurrency(order.subtotalVnd)}</td></tr>
			${discountHtml}
			<tr><td style="text-align:left">Phí vận chuyển:</td><td style="text-align:right">${order.shippingVnd === 0 ? 'Miễn phí' : formatCurrency(order.shippingVnd)}</td></tr>
			<tr class="total-row"><td style="text-align:left">Tổng cộng:</td><td style="text-align:right">${formatCurrency(order.totalVnd)}</td></tr>
		</table>
	</div>

	<div class="words">Số tiền viết bằng chữ: ${numberToWords(order.totalVnd)}.</div>

	<table class="payinfo"><tr><td class="pil">Hình thức thanh toán:</td><td>${payMethod}</td></tr><tr><td class="pil">Trạng thái thanh toán:</td><td>${payStatus}</td></tr></table>

	<div class="sigs">
		<div class="sig"><div class="sig-label">Người mua hàng</div><div class="sig-hint">(Ký, ghi rõ họ tên)</div></div>
		<div class="sig"><div class="sig-label">Người bán hàng</div><div class="sig-hint">(Ký, ghi rõ họ tên)</div></div>
	</div>
	<div class="fdate">Ngày in: ${dateStr}</div>
</div>
<script>window.onload=function(){setTimeout(function(){window.print();window.close()},300)}</script>
</body>
</html>`;

	const w = window.open('', '_blank');
	if (!w) {
		alert('Trình duyệt đã chặn popup. Vui lòng cho phép popup rồi thử lại.');
		return;
	}
	w.document.write(html);
	w.document.close();
}
