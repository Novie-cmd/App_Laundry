import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Employee, Role } from '../../types';
import { ShieldCheck, Plus, Edit2, Trash2, Key, CheckCircle, ShieldAlert } from 'lucide-react';

export const EmployeesMasterView: React.FC = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee, currentUser } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>('kasir');
  const [position, setPosition] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [active, setActive] = useState(true);

  const roleDescriptions: Record<Role, { title: string; desc: string; badge: string }> = {
    owner: {
      title: 'Owner (Pemilik Toko)',
      desc: 'Akses penuh ke semua menu: Laporan laba rugi, pengaturan harga, manajemen pengguna, dan keuangan.',
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
    },
    admin: {
      title: 'Admin Operasional',
      desc: 'Mengelola pelanggan, layanan, transaksi, pembayaran kasir, pengeluaran & stok.',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    kasir: {
      title: 'Kasir Front Office',
      desc: 'Transaksi baru POS, penerimaan pembayaran, cetak struk thermal, input pelanggan, dan laci kas.',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    operator: {
      title: 'Operator Cuci & Setrika',
      desc: 'Melihat antrean kerja cucian & mengubah status laundry (Dicuci, Kering, Setrika, Siap Ambil). Tidak dapat melihat omzet/laba rugi.',
      badge: 'bg-amber-100 text-amber-800 border-amber-300',
    },
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setRole('kasir');
    setPosition('Kasir Front Office');
    setUsername('');
    setPassword('123');
    setPhone('');
    setActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (e: Employee) => {
    setEditingId(e.id);
    setName(e.name);
    setRole(e.role);
    setPosition(e.position);
    setUsername(e.username);
    setPassword(e.password || '');
    setPhone(e.phone);
    setActive(e.active);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      updateEmployee(editingId, {
        name,
        role,
        position,
        username,
        password,
        phone,
        active,
      });
    } else {
      addEmployee({
        name,
        role,
        position,
        username,
        password,
        phone,
        active,
      });
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Role explanation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {(Object.keys(roleDescriptions) as Role[]).map((r) => {
          const info = roleDescriptions[r];
          return (
            <div key={r} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${info.badge}`}
              >
                {r}
              </span>
              <div className="font-bold text-xs text-slate-900">{info.title}</div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{info.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Control bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900">
            Daftar Akun Pegawai & Hak Akses
          </h3>
          <p className="text-xs text-slate-500">
            Kelola username, password login kasir, dan penugasan peran
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Tambah Pegawai
        </button>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 font-semibold">Nama Pegawai</th>
                <th className="px-5 py-3.5 font-semibold">Jabatan</th>
                <th className="px-5 py-3.5 font-semibold">Username Login</th>
                <th className="px-5 py-3.5 font-semibold">Hak Akses (Role)</th>
                <th className="px-5 py-3.5 font-semibold">No. Telepon</th>
                <th className="px-5 py-3.5 font-semibold">Status Akun</th>
                <th className="px-5 py-3.5 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{emp.name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{emp.id}</div>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">{emp.position}</td>
                  <td className="px-5 py-3.5 font-mono text-slate-800 font-semibold">
                    {emp.username}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        roleDescriptions[emp.role].badge
                      }`}
                    >
                      {emp.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 font-mono">{emp.phone || '-'}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      {emp.active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(emp)}
                        className="p-1.5 text-slate-600 hover:text-cyan-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Edit Pegawai"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {emp.id !== currentUser.id && (
                        <button
                          onClick={() => deleteEmployee(emp.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD Employee */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <h3 className="font-semibold text-base">
                {editingId ? 'Edit Pegawai' : 'Tambah Pegawai Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Rudi Hartono"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hak Akses (Role)
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-cyan-500 uppercase"
                  >
                    <option value="owner">Owner</option>
                    <option value="admin">Admin</option>
                    <option value="kasir">Kasir</option>
                    <option value="operator">Operator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Jabatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kasir Shift Pagi"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username Login *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: rudi"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password / PIN
                  </label>
                  <input
                    type="password"
                    placeholder="123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  No. Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="empActive"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4"
                />
                <label htmlFor="empActive" className="text-xs font-semibold text-slate-700">
                  Akun Aktif (Dapat Login)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-xl shadow-xs"
                >
                  Simpan Pegawai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
