import { useState } from 'react';
import AdminCRUD from '../../components/admin/AdminCRUD';
import { eventAPI } from '../../api';

const CATEGORIES = [
  { value: 'hackathon', label: 'Hackathon' },
  { value: 'olympiad', label: 'Olimpiada' },
  { value: 'seminar', label: 'Seminar' },
  { value: 'conference', label: 'Konferensiya' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'open-day', label: 'Ochiq eshiklar kuni' },
  { value: 'competition', label: 'Musobaqa' },
  { value: 'other', label: 'Boshqa' },
];

function EventForm({ initialData, onSubmit, loading }) {
  const [form, setForm] = useState({
    title: initialData.title || '',
    category: initialData.category || 'hackathon',
    date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
    time: initialData.time || '10:00',
    location: initialData.location || '',
    shortDescription: initialData.shortDescription || '',
    content: initialData.content || '',
    registrationLink: initialData.registrationLink || '',
    maxParticipants: initialData.maxParticipants || '',
    published: initialData.published !== false,
    featured: initialData.featured || false,
  });

  const [coverFile, setCoverFile] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (coverFile) {
      fd.append('coverImage', coverFile);
    }
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Tadbir nomi *</label>
        <input
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="input-field text-sm"
          placeholder="Respublika AI Hackathoni 2026..."
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Kategoriya</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="input-field text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Manzil / Joylashuv</label>
          <input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="input-field text-sm"
            placeholder="Toshkent, IT-Park yoki Onlayn"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="label">Sana *</label>
          <input
            required
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="input-field text-sm"
          />
        </div>
        <div>
          <label className="label">Vaqt</label>
          <input
            value={form.time}
            onChange={(e) => setForm({ ...form, time: e.target.value })}
            className="input-field text-sm"
            placeholder="10:00"
          />
        </div>
        <div>
          <label className="label">Maks. ishtirokchilar</label>
          <input
            type="number"
            value={form.maxParticipants}
            onChange={(e) => setForm({ ...form, maxParticipants: e.target.value })}
            className="input-field text-sm"
            placeholder="100"
          />
        </div>
      </div>

      <div>
        <label className="label">Ro'yxatdan o'tish havolasi</label>
        <input
          type="url"
          value={form.registrationLink}
          onChange={(e) => setForm({ ...form, registrationLink: e.target.value })}
          className="input-field text-sm"
          placeholder="https://t.me/nis_hackathon_bot"
        />
      </div>

      <div>
        <label className="label">Qisqa tavsif</label>
        <textarea
          rows={2}
          value={form.shortDescription}
          onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
          className="input-field text-sm resize-none"
        />
      </div>

      <div>
        <label className="label">Batafsil ma'lumot</label>
        <textarea
          rows={4}
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          className="input-field text-sm resize-none"
        />
      </div>

      <div>
        <label className="label">Muqova rasmi</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files[0])}
          className="input-field py-2 text-sm"
        />
      </div>

      <div className="flex items-center gap-4 pt-1">
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
            className="rounded text-blue-600"
          />
          Nashr qilish
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
            className="rounded text-blue-600"
          />
          Asosiy sahifada ko'rsatish
        </label>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
        {loading ? 'Saqlanmoqda...' : 'Saqlash'}
      </button>
    </form>
  );
}

export default function AdminEvents() {
  const columns = [
    {
      key: 'coverImage',
      label: 'Rasm',
      render: (v) => (
        <div className="w-12 h-9 rounded-lg bg-slate-100 overflow-hidden flex items-center justify-center">
          {v ? (
            <img src={v} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-slate-400">Rasm yo'q</span>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Nomi',
      render: (v, item) => (
        <div className="max-w-md">
          <p className="font-semibold text-slate-900 line-clamp-1">{v}</p>
          <span className="badge-blue text-[11px] capitalize">{item.category}</span>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Sana & Vaqt',
      render: (v, item) => (
        <div>
          <p className="text-xs font-semibold text-slate-800">
            {v ? new Date(v).toLocaleDateString('uz-UZ') : '—'}
          </p>
          <p className="text-[11px] text-slate-400">{item.time || ''}</p>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Manzil',
      render: (v) => <span className="text-xs text-slate-600 line-clamp-1">{v || '—'}</span>,
    },
    {
      key: 'published',
      label: 'Holat',
      render: (v) => (
        <span className={v ? 'badge-green' : 'badge-yellow'}>
          {v ? 'Faol' : 'Qoralama'}
        </span>
      ),
    },
  ];

  return (
    <AdminCRUD
      title="Tadbirlar"
      queryKey="admin-events"
      fetchFn={eventAPI.getAllAdmin}
      deleteFn={eventAPI.delete}
      createFn={eventAPI.create}
      updateFn={eventAPI.update}
      columns={columns}
      FormComponent={EventForm}
    />
  );
}
