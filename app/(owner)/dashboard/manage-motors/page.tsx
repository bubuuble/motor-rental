'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Wrench, Loader2, X, Save, AlertTriangle, CheckCircle, ChevronUp, ImageIcon } from 'lucide-react';
import { useSweetAlert } from '@/utils/useSweetAlert';

interface MotorDB {
  id: string;
  name: string;
  brand: string;
  year: string;
  cc: string;
  transmission: string;
  fuel: string;
  daily_price: number;
  weekly_price: number;
  monthly_price: number;
  weekend_price: number;
  description: string;
  service_status: string;
  image_url: string | null;
}

type EditForm = Omit<MotorDB, 'id'>;

const EMPTY_FORM: EditForm = {
  name: '', brand: '', year: '', cc: '', transmission: 'Matic', fuel: 'Bensin',
  daily_price: 0, weekly_price: 0, monthly_price: 0, weekend_price: 0,
  description: '', service_status: 'Baik', image_url: null,
};

const inputCls = 'w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-blue-500 focus:bg-white transition-all font-medium text-slate-900 text-sm';

// Extract filename from storage URL
function extractStoragePath(url: string | null): string | null {
  if (!url) return null;
  try {
    const parts = url.split('/object/public/motors/');
    return parts.length > 1 ? parts[1] : null;
  } catch {
    return null;
  }
}

export default function PengelolaanDataMotor() {
  const [motors, setMotors] = useState<MotorDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMotor, setEditingMotor] = useState<MotorDB | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState<EditForm>(EMPTY_FORM);
  const [isAdding, setIsAdding] = useState(false);
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  // Inline service status update tracking
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);
  const swal = useSweetAlert();

  const fetchMotors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('motors')
        .select('id, name, brand, year, cc, transmission, fuel, daily_price, weekly_price, monthly_price, weekend_price, description, service_status, image_url')
        .order('name');
      if (data) setMotors(data as MotorDB[]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => { fetchMotors(); }, [fetchMotors]);

  // Open edit modal
  const openEdit = (m: MotorDB) => {
    setEditingMotor(m);
    setEditForm({
      name: m.name,
      brand: m.brand || '',
      year: m.year || '',
      cc: m.cc || '',
      transmission: m.transmission || 'Matic',
      fuel: m.fuel || 'Bensin',
      daily_price: m.daily_price || 0,
      weekly_price: m.weekly_price || 0,
      monthly_price: m.monthly_price || 0,
      weekend_price: m.weekend_price || 0,
      description: m.description || '',
      service_status: m.service_status || 'Baik',
      image_url: m.image_url,
    });
    setEditImageFile(null);
    setEditImagePreview(null);
  };

  // Handle inline service status change
  const handleServiceStatusChange = async (motorId: string, newStatus: string) => {
    setUpdatingStatusId(motorId);
    try {
      await supabase.from('motors').update({ service_status: newStatus }).eq('id', motorId);
      setMotors(prev => prev.map(m => m.id === motorId ? { ...m, service_status: newStatus } : m));
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Save motor edit
  const handleSaveEdit = async () => {
    if (!editingMotor) return;
    setIsSaving(true);
    try {
      let image_url = editForm.image_url;

      if (editImageFile) {
        // Delete old image from Storage
        const oldPath = extractStoragePath(editingMotor.image_url);
        if (oldPath) {
          await supabase.storage.from('motors').remove([oldPath]);
        }
        // Upload new
        const ext = editImageFile.name.split('.').pop();
        const fileName = `motor-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('motors').upload(fileName, editImageFile);
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from('motors').getPublicUrl(fileName);
          image_url = publicUrl;
        }
      }

      const { error } = await supabase.from('motors').update({
        name: editForm.name,
        brand: editForm.brand,
        year: editForm.year,
        cc: editForm.cc,
        transmission: editForm.transmission,
        fuel: editForm.fuel,
        daily_price: editForm.daily_price,
        weekly_price: editForm.weekly_price,
        monthly_price: editForm.monthly_price,
        weekend_price: editForm.weekend_price,
        description: editForm.description,
        service_status: editForm.service_status,
        image_url,
      }).eq('id', editingMotor.id);

      if (error) throw error;

      swal.success('Motor Diperbarui', `Motor "${editForm.name}" berhasil diperbarui!`);
      setEditingMotor(null);
      await fetchMotors();
    } catch {
      swal.error('Gagal Menyimpan', 'Gagal menyimpan perubahan. Coba lagi.');
    } finally {
      setIsSaving(false);
    }
  };

  // Save new motor
  const handleAddMotor = async () => {
    if (!addForm.name || !addForm.brand || !addForm.year || !addForm.daily_price) {
      swal.warning('Data Tidak Lengkap', 'Harap isi: Nama, Brand, Tahun, dan Harga Harian');
      return;
    }
    setIsAdding(true);
    try {
      let image_url: string | null = null;
      if (addImageFile) {
        const ext = addImageFile.name.split('.').pop();
        const fileName = `motor-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from('motors').upload(fileName, addImageFile);
        if (!upErr) {
          const { data: { publicUrl } } = supabase.storage.from('motors').getPublicUrl(fileName);
          image_url = publicUrl;
        }
      }
      const { error } = await supabase.from('motors').insert({
        ...addForm,
        image_url,
        status: 'Tersedia',
        service_status: 'Baik',
        rating: 5.0,
      });
      if (error) throw error;
      swal.success('Motor Ditambahkan', `Motor "${addForm.name}" berhasil ditambahkan!`);
      setAddForm(EMPTY_FORM);
      setAddImageFile(null);
      setAddImagePreview(null);
      setShowAddForm(false);
      await fetchMotors();
    } catch {
      swal.error('Gagal Menambah Motor', 'Gagal menambah motor. Coba lagi.');
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Pengelolaan Data Motor</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Home › Pengelolaan Data Motor</p>
        </div>
        <button
          onClick={() => setShowAddForm(v => !v)}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200"
        >
          {showAddForm ? <ChevronUp size={16} strokeWidth={2.5} /> : <Plus size={16} strokeWidth={2.5} />}
          {showAddForm ? 'Tutup Form' : 'Tambah Motor Baru'}
        </button>
      </div>

      {/* Success */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl animate-in fade-in duration-300">
          <CheckCircle size={20} className="text-green-600 shrink-0" strokeWidth={2.5} />
          <p className="text-sm font-black text-green-800">{successMsg}</p>
        </div>
      )}

      {/* Add Motor Form */}
      {showAddForm && (
        <div className="bg-white border-2 border-blue-500 rounded-2xl shadow-lg overflow-hidden animate-in slide-in-from-top-4 duration-300">
          <div className="p-6 border-b border-blue-100 bg-blue-50 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center"><Plus size={20} className="text-white" strokeWidth={2.5} /></div>
            <div>
              <h3 className="font-black text-slate-900 text-lg">Tambah Motor Baru</h3>
              <p className="text-xs text-slate-500 font-semibold">Lengkapi informasi unit motor baru</p>
            </div>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField label="Nama Motor *"><input value={addForm.name} onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))} placeholder="Honda Beat ESP 2015" className={inputCls} /></FormField>
            <FormField label="Brand *"><input value={addForm.brand} onChange={e => setAddForm(f => ({ ...f, brand: e.target.value }))} placeholder="Honda" className={inputCls} /></FormField>
            <FormField label="Tahun *"><input value={addForm.year} onChange={e => setAddForm(f => ({ ...f, year: e.target.value }))} placeholder="2024" type="number" className={inputCls} /></FormField>
            <FormField label="CC Mesin"><input value={addForm.cc} onChange={e => setAddForm(f => ({ ...f, cc: e.target.value }))} placeholder="110cc" className={inputCls} /></FormField>
            <FormField label="Transmisi"><select value={addForm.transmission} onChange={e => setAddForm(f => ({ ...f, transmission: e.target.value }))} className={inputCls}><option>Matic</option><option>Manual</option></select></FormField>
            <FormField label="Bahan Bakar"><select value={addForm.fuel} onChange={e => setAddForm(f => ({ ...f, fuel: e.target.value }))} className={inputCls}><option>Bensin</option><option>Listrik</option></select></FormField>
            <FormField label="Harga Harian (Rp) *"><input value={addForm.daily_price || ''} onChange={e => setAddForm(f => ({ ...f, daily_price: parseInt(e.target.value) || 0 }))} placeholder="70000" type="number" className={inputCls} /></FormField>
            <FormField label="Harga Mingguan (Rp)"><input value={addForm.weekly_price || ''} onChange={e => setAddForm(f => ({ ...f, weekly_price: parseInt(e.target.value) || 0 }))} placeholder="420000" type="number" className={inputCls} /></FormField>
            <FormField label="Harga Bulanan (Rp)"><input value={addForm.monthly_price || ''} onChange={e => setAddForm(f => ({ ...f, monthly_price: parseInt(e.target.value) || 0 }))} placeholder="1500000" type="number" className={inputCls} /></FormField>
            <FormField label="Harga Weekend (Rp)"><input value={addForm.weekend_price || ''} onChange={e => setAddForm(f => ({ ...f, weekend_price: parseInt(e.target.value) || 0 }))} placeholder="150000" type="number" className={inputCls} /></FormField>
            <div className="md:col-span-2"><FormField label="Deskripsi"><textarea value={addForm.description} onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))} placeholder="Deskripsi singkat..." rows={3} className={`${inputCls} resize-none`} /></FormField></div>
            <div className="lg:col-span-3"><FormField label="Foto Motor">
              <label className="flex flex-col items-center justify-center gap-3 p-6 border-2 border-dashed border-blue-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all bg-slate-50">
                {addImagePreview ? <img src={addImagePreview} alt="Preview" className="h-32 object-contain rounded-lg" /> : <ImageIcon size={36} className="text-blue-300" strokeWidth={1.5} />}
                <span className="text-xs font-bold text-slate-500">Klik untuk pilih foto motor</span>
                <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setAddImageFile(f); setAddImagePreview(URL.createObjectURL(f)); } }} className="hidden" />
              </label>
            </FormField></div>
          </div>
          <div className="px-8 pb-8 flex gap-3 justify-end">
            <button onClick={() => { setAddForm(EMPTY_FORM); setShowAddForm(false); setAddImageFile(null); setAddImagePreview(null); }} className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-700 transition">Batal</button>
            <button onClick={() => void handleAddMotor()} disabled={isAdding} className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-black hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200 disabled:opacity-50">
              {isAdding ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
              Simpan Motor
            </button>
          </div>
        </div>
      )}

      {/* Motors Table */}
      <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-blue-100">
          <h3 className="font-black text-slate-900 text-lg">Data Motor ({motors.length})</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">Klik Detail untuk edit informasi motor</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-blue-50/60 border-b border-blue-100">
              <tr>
                <th className="p-5 font-black uppercase text-[10px] text-blue-600 tracking-widest">Unit Motor</th>
                <th className="p-5 font-black uppercase text-[10px] text-blue-600 tracking-widest">Harga Harian</th>
                <th className="p-5 font-black uppercase text-[10px] text-blue-600 tracking-widest">Status Servis</th>
                <th className="p-5 font-black uppercase text-[10px] text-blue-600 tracking-widest text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {motors.map((m, index) => (
                <tr key={m.id} className="hover:bg-blue-50/40 transition-all animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${index * 40}ms` }}>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      {m.image_url ? (
                        <img src={m.image_url} alt={m.name} className="w-12 h-12 object-contain rounded-lg bg-slate-100" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center"><ImageIcon size={18} className="text-slate-300" /></div>
                      )}
                      <div>
                        <p className="font-black text-slate-900">{m.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{m.brand} · {m.year} · {m.cc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <p className="font-black text-slate-900">Rp {(m.daily_price || 0).toLocaleString('id-ID')}</p>
                    <p className="text-[10px] text-slate-400 font-bold">/hari</p>
                  </td>
                  <td className="p-5">
                    <div className="relative flex items-center gap-2">
                      {updatingStatusId === m.id && <Loader2 size={14} className="animate-spin text-blue-500 absolute -left-5" />}
                      <select
                        value={m.service_status || 'Baik'}
                        onChange={e => void handleServiceStatusChange(m.id, e.target.value)}
                        disabled={updatingStatusId === m.id}
                        className={`pl-3 pr-8 py-2 rounded-lg border text-[10px] font-black uppercase appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 ${
                          m.service_status === 'Baik' ? 'bg-green-50 text-green-700 border-green-200' :
                          m.service_status === 'Perlu Servis' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                          'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        <option value="Baik">Baik</option>
                        <option value="Perlu Servis">Perlu Servis</option>
                        <option value="Dalam Perbaikan">Dalam Perbaikan</option>
                      </select>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <button
                      onClick={() => openEdit(m)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-200 text-blue-600 text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all"
                    >
                      <Wrench size={13} strokeWidth={2.5} />
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Motor Modal */}
      {editingMotor && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in duration-200 my-8">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-black text-slate-900 text-lg">Edit Motor</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">{editingMotor.name}</p>
              </div>
              <button onClick={() => setEditingMotor(null)} className="hover:bg-slate-100 p-1.5 rounded-lg transition"><X size={20} strokeWidth={2.5} /></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto">
              {/* Image */}
              <div className="md:col-span-2">
                <FormField label="Foto Motor">
                  <label className="flex flex-col items-center justify-center gap-3 p-5 border-2 border-dashed border-blue-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all bg-slate-50">
                    {editImagePreview ? (
                      <img src={editImagePreview} alt="Preview baru" className="h-28 object-contain rounded-lg" />
                    ) : editForm.image_url ? (
                      <div className="flex flex-col items-center gap-2">
                        <img src={editForm.image_url} alt="Foto saat ini" className="h-28 object-contain rounded-lg" />
                        <span className="text-[10px] font-bold text-slate-400">Klik untuk ganti foto (foto lama akan dihapus)</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon size={32} className="text-blue-300" strokeWidth={1.5} />
                        <span className="text-xs font-bold text-slate-500">Klik untuk upload foto</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) { setEditImageFile(f); setEditImagePreview(URL.createObjectURL(f)); } }} className="hidden" />
                  </label>
                </FormField>
                {editImageFile && (
                  <p className="mt-2 flex items-center gap-2 text-[10px] font-black text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                    <AlertTriangle size={12} strokeWidth={2.5} /> Foto lama akan dihapus dari storage saat disimpan
                  </p>
                )}
              </div>

              <FormField label="Nama Motor *"><input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} className={inputCls} /></FormField>
              <FormField label="Brand *"><input value={editForm.brand} onChange={e => setEditForm(f => ({ ...f, brand: e.target.value }))} className={inputCls} /></FormField>
              <FormField label="Tahun"><input value={editForm.year} onChange={e => setEditForm(f => ({ ...f, year: e.target.value }))} type="number" className={inputCls} /></FormField>
              <FormField label="CC Mesin"><input value={editForm.cc} onChange={e => setEditForm(f => ({ ...f, cc: e.target.value }))} placeholder="110cc" className={inputCls} /></FormField>
              <FormField label="Transmisi"><select value={editForm.transmission} onChange={e => setEditForm(f => ({ ...f, transmission: e.target.value }))} className={inputCls}><option>Matic</option><option>Manual</option></select></FormField>
              <FormField label="Bahan Bakar"><select value={editForm.fuel} onChange={e => setEditForm(f => ({ ...f, fuel: e.target.value }))} className={inputCls}><option>Bensin</option><option>Listrik</option></select></FormField>
              <FormField label="Harga Harian (Rp)"><input value={editForm.daily_price || ''} onChange={e => setEditForm(f => ({ ...f, daily_price: parseInt(e.target.value) || 0 }))} type="number" className={inputCls} /></FormField>
              <FormField label="Harga Mingguan (Rp)"><input value={editForm.weekly_price || ''} onChange={e => setEditForm(f => ({ ...f, weekly_price: parseInt(e.target.value) || 0 }))} type="number" className={inputCls} /></FormField>
              <FormField label="Harga Bulanan (Rp)"><input value={editForm.monthly_price || ''} onChange={e => setEditForm(f => ({ ...f, monthly_price: parseInt(e.target.value) || 0 }))} type="number" className={inputCls} /></FormField>
              <FormField label="Harga Weekend (Rp)"><input value={editForm.weekend_price || ''} onChange={e => setEditForm(f => ({ ...f, weekend_price: parseInt(e.target.value) || 0 }))} type="number" className={inputCls} /></FormField>
              <div className="md:col-span-2"><FormField label="Deskripsi"><textarea value={editForm.description} onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))} rows={3} className={`${inputCls} resize-none`} /></FormField></div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50 flex gap-3 justify-end sticky bottom-0">
              <button onClick={() => setEditingMotor(null)} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-700 transition">Batal</button>
              <button onClick={() => void handleSaveEdit()} disabled={isSaving}
                className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200 disabled:opacity-50">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} strokeWidth={2.5} />}
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}
