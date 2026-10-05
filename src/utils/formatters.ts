import { Transaction, StoreSettings, Customer, LaundryStatus } from '../types';

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export const formatRupiahShort = (amount: number): string => {
  if (Math.abs(amount) >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1).replace('.0', '')} Jt`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)} Rb`;
  }
  return `Rp ${amount.toLocaleString('id-ID')}`;
};

export const formatDateIndo = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export const formatDateOnly = (dateStr: string): string => {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

export const getStatusBadgeInfo = (status: LaundryStatus) => {
  switch (status) {
    case 'diterima':
      return {
        label: 'Diterima',
        bg: 'bg-amber-100 text-amber-800 border-amber-300',
        badgeColor: 'amber',
        step: 1,
        icon: 'Inbox',
      };
    case 'dicuci':
      return {
        label: 'Dicuci',
        bg: 'bg-blue-100 text-blue-800 border-blue-300',
        badgeColor: 'blue',
        step: 2,
        icon: 'Droplets',
      };
    case 'dikeringkan':
      return {
        label: 'Dikeringkan',
        bg: 'bg-cyan-100 text-cyan-800 border-cyan-300',
        badgeColor: 'cyan',
        step: 3,
        icon: 'Wind',
      };
    case 'disetrika':
      return {
        label: 'Disetrika',
        bg: 'bg-purple-100 text-purple-800 border-purple-300',
        badgeColor: 'purple',
        step: 4,
        icon: 'Flame',
      };
    case 'siap_diambil':
      return {
        label: 'Siap Diambil',
        bg: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-semibold',
        badgeColor: 'emerald',
        step: 5,
        icon: 'CheckCircle2',
      };
    case 'selesai':
      return {
        label: 'Selesai (Diambil)',
        bg: 'bg-slate-100 text-slate-700 border-slate-300',
        badgeColor: 'slate',
        step: 6,
        icon: 'PackageCheck',
      };
    default:
      return {
        label: status,
        bg: 'bg-gray-100 text-gray-700 border-gray-300',
        badgeColor: 'gray',
        step: 0,
        icon: 'Clock',
      };
  }
};

export const generateWhatsAppMessage = (
  type: 'diterima' | 'diproses' | 'selesai' | 'belum_diambil' | 'tagihan_piutang',
  trx: Transaction,
  settings: StoreSettings
): string => {
  const lineItems = trx.items
    .map(
      (item) =>
        `• ${item.serviceName}: ${item.quantity} ${item.unit} x ${formatRupiah(item.price)} = ${formatRupiah(item.subtotal)}`
    )
    .join('\n');

  const greeting = `Halo Kak *${trx.customerName}*, salam dari *${settings.storeName}* ✨`;

  switch (type) {
    case 'diterima':
      return `${greeting}

Pesanan laundry Anda telah berhasil *DITERIMA* dengan rincian:
🔖 *No. Nota:* ${trx.invoiceNumber}
📅 *Tgl Masuk:* ${trx.date}
⏰ *Estimasi Selesai:* ${trx.estimatedCompletionDate}
🧺 *Rincian Cucian:*
${lineItems}
-----------------------------
Subtotal: ${formatRupiah(trx.subtotal)}
${trx.discount > 0 ? `Diskon: -${formatRupiah(trx.discount)}\n` : ''}${trx.additionalFee > 0 ? `Biaya Tambahan: +${formatRupiah(trx.additionalFee)}\n` : ''}*TOTAL: ${formatRupiah(trx.grandTotal)}*
Terbayar: ${formatRupiah(trx.paidAmount)}
*Sisa Bayar:* ${formatRupiah(trx.remainingAmount)} (${trx.paymentStatus.toUpperCase()})
-----------------------------
📍 Lokasi Rak: ${trx.rackLocation || 'Front Desk'}
Cucian Anda sedang dijadwalkan untuk diproses dengan higienis dan wangi. Terima kasih! 🙏`;

    case 'diproses':
      return `${greeting}

Pakaian laundry Anda dengan *No. Nota: ${trx.invoiceNumber}* saat ini *SEDANG DALAM PROSES* (${trx.status.toUpperCase()}).
Estimasi selesai: *${trx.estimatedCompletionDate}*.

Kami pastikan cucian Anda ditangani dengan deterjen berkualitas dan higienis! 🧼✨`;

    case 'selesai':
      return `${greeting}

Kabar gembira! Cucian Anda sudah *SELESAI & SIAP DIAMBIL*! 👕🌸
🔖 *No. Nota:* ${trx.invoiceNumber}
📦 *Lokasi Rak:* ${trx.rackLocation || 'Rak Siap Diambil'}
💰 *Sisa Pembayaran:* ${trx.remainingAmount > 0 ? `*${formatRupiah(trx.remainingAmount)}* (Belum Lunas)` : '*LUNAS* ✅'}

Silakan tunjukkan pesan/nota ini saat mengambil di outlet kami:
🏢 *${settings.storeName}*
📍 ${settings.address}
📞 ${settings.phone}

Terima kasih telah mempercayakan pakaian Anda kepada kami! 😊`;

    case 'belum_diambil':
      return `${greeting}

Mengingatkan kembali bahwa cucian Anda dengan *No. Nota: ${trx.invoiceNumber}* sudah selesai dan *BELUM DIAMBIL* di outlet kami.
📦 *Lokasi Rak:* ${trx.rackLocation || 'Rak Siap Diambil'}
💰 *Sisa Tagihan:* ${formatRupiah(trx.remainingAmount)}

Mohon dapat segera diambil ya kak agar pakaian tetap fresh dan rapi.
Outlet buka setiap hari pukul 07.30 - 21.00 WIB. Terima kasih! 🙏`;

    case 'tagihan_piutang':
      return `${greeting}

Pemberitahuan tagihan piutang laundry atas *No. Nota: ${trx.invoiceNumber}*:
Total Transaksi: ${formatRupiah(trx.grandTotal)}
Sudah Dibayar: ${formatRupiah(trx.paidAmount)}
*Sisa Tagihan:* *${formatRupiah(trx.remainingAmount)}*

Pembayaran dapat ditransfer ke:
${settings.bankAccountInfo || 'Silakan hubungi kasir'}

Konfirmasi pembayaran via WA ini ya kak. Terima kasih banyak atas kerjasamanya! 🙏`;
  }
};

export const openWhatsApp = (phone: string, text: string) => {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('0')) {
    cleanPhone = '62' + cleanPhone.slice(1);
  }
  const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

export const exportToCSV = (filename: string, rows: (string | number)[][]) => {
  const processRow = (row: (string | number)[]) => {
    let finalVal = '';
    for (let j = 0; j < row.length; j++) {
      let innerValue = row[j] === null || row[j] === undefined ? '' : row[j].toString();
      let result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ',';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  let csvFile = '\uFEFF'; // UTF-8 BOM for Excel
  for (let i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
