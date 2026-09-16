import Head from 'next/head';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { apiFetch } from '@/services/api';
import styles from './Swagger.module.css';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type TableMeta = {
  name: string;
  label: string;
  key: string;
  group: string;
  columns: string[];
  procedures?: Record<'POST' | 'PUT' | 'DELETE', string>;
};
type TableResponse = { table?: string; count?: number; rows?: Record<string, unknown>[] };

const tableDefinitions: TableMeta[] = [
  { name: 'VaiTro', label: 'Vai trò', key: 'MaVaiTro', group: 'Hệ thống', columns: ['MaVaiTro', 'TenVaiTro'], procedures: { POST: 'sp_ThemVaiTro', PUT: 'sp_SuaVaiTro', DELETE: 'sp_XoaVaiTro' } },
  { name: 'NguoiDung', label: 'Người dùng', key: 'MaNguoiDung', group: 'Hệ thống', columns: ['MaNguoiDung', 'MaVaiTro', 'TenDangNhap', 'MatKhau', 'HoTen', 'Email', 'SoDienThoai', 'DiaChi', 'HinhAnh'], procedures: { POST: 'sp_ThemNguoiDung', PUT: 'sp_SuaNguoiDung', DELETE: 'sp_XoaNguoiDung' } },
  { name: 'HangXe', label: 'Hãng xe', key: 'MaHang', group: 'Danh mục xe', columns: ['MaHang', 'TenHang', 'Logo'], procedures: { POST: 'sp_ThemHangXe', PUT: 'sp_SuaHangXe', DELETE: 'sp_XoaHangXe' } },
  { name: 'LoaiXe', label: 'Loại xe', key: 'MaLoai', group: 'Danh mục xe', columns: ['MaLoai', 'TenLoai'], procedures: { POST: 'sp_ThemLoaiXe', PUT: 'sp_SuaLoaiXe', DELETE: 'sp_XoaLoaiXe' } },
  { name: 'Xe', label: 'Xe', key: 'MaXe', group: 'Danh mục xe', columns: ['MaXe', 'MaHang', 'MaLoai', 'TenXe', 'Gia', 'NamSanXuat', 'MauSac', 'MoTa', 'SoLuong'], procedures: { POST: 'sp_ThemXe', PUT: 'sp_SuaXe', DELETE: 'sp_XoaXe' } },
  { name: 'HinhAnhXe', label: 'Hình ảnh xe', key: 'MaHinhAnh', group: 'Danh mục xe', columns: ['MaHinhAnh', 'MaXe', 'DuongDanAnh', 'LaAnhChinh'], procedures: { POST: 'sp_ThemHinhAnhXe', PUT: 'sp_SuaHinhAnhXe', DELETE: 'sp_XoaHinhAnhXe' } },
  { name: 'GioHang', label: 'Giỏ hàng', key: 'MaGioHang', group: 'Bán hàng', columns: ['MaGioHang', 'MaNguoiDung', 'NgayTao'], procedures: { POST: 'sp_ThemGioHang', PUT: 'sp_SuaGioHang', DELETE: 'sp_XoaGioHang' } },
  { name: 'ChiTietGioHang', label: 'Chi tiết giỏ hàng', key: 'MaGioHang + MaXe', group: 'Bán hàng', columns: ['MaGioHang', 'MaXe', 'SoLuong'], procedures: { POST: 'sp_ThemChiTietGioHang', PUT: 'sp_SuaChiTietGioHang', DELETE: 'sp_XoaChiTietGioHang' } },
  { name: 'DonHang', label: 'Đơn hàng', key: 'MaDonHang', group: 'Bán hàng', columns: ['MaDonHang', 'MaNguoiDung', 'HoTenNguoiNhan', 'SoDienThoai', 'DiaChi', 'TongTien', 'PhuongThucThanhToan', 'TrangThai', 'NgayDat'], procedures: { POST: 'sp_ThemDonHang', PUT: 'sp_SuaDonHang', DELETE: 'sp_XoaDonHang' } },
  { name: 'ChiTietDonHang', label: 'Chi tiết đơn hàng', key: 'MaDonHang + MaXe', group: 'Bán hàng', columns: ['MaDonHang', 'MaXe', 'SoLuong', 'DonGia'], procedures: { POST: 'sp_ThemChiTietDonHang', PUT: 'sp_SuaChiTietDonHang', DELETE: 'sp_XoaChiTietDonHang' } },
  { name: 'MaXacNhan', label: 'Mã xác nhận', key: 'MaXacNhan', group: 'Hệ thống', columns: ['MaXacNhan'] },
  { name: 'DanhMucTinTuc', label: 'Danh mục tin tức', key: 'MaDanhMuc', group: 'Tin tức', columns: ['MaDanhMuc', 'TenDanhMuc'], procedures: { POST: 'sp_ThemDanhMucTinTuc', PUT: 'sp_SuaDanhMucTinTuc', DELETE: 'sp_XoaDanhMucTinTuc' } },
  { name: 'TinTuc', label: 'Tin tức', key: 'MaTinTuc', group: 'Tin tức', columns: ['MaTinTuc', 'MaDanhMuc', 'TieuDe', 'TomTat', 'NoiDung', 'HinhAnh', 'NgayDang'], procedures: { POST: 'sp_ThemTinTuc', PUT: 'sp_SuaTinTuc', DELETE: 'sp_XoaTinTuc' } },
];

const methodInfo: Record<HttpMethod, { title: string; description: string }> = {
  GET: { title: 'Lấy danh sách bản ghi', description: 'Đọc dữ liệu hiện có của bảng.' },
  POST: { title: 'Tạo bản ghi mới', description: 'Gửi JSON để thêm dữ liệu qua Stored Procedure.' },
  PUT: { title: 'Cập nhật bản ghi', description: 'Gửi JSON gồm khóa chính và dữ liệu mới.' },
  DELETE: { title: 'Xóa bản ghi', description: 'Gửi JSON gồm khóa chính cần xóa.' },
};
const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE'];
const prettyJson = (value: unknown) => JSON.stringify(value, null, 2);
const emptyBody = (table: TableMeta, method: HttpMethod) => {
  if (method === 'GET') return '';
  if (method === 'DELETE') return prettyJson({ [table.key.split(' + ')[0]]: 1 });
  return prettyJson(Object.fromEntries(table.columns.filter((column) => !column.startsWith('Ma') || method === 'PUT').map((column) => [column, ''])));
};

export default function SwaggerPage() {
  const [openTables, setOpenTables] = useState<Record<string, boolean>>({});
  const [openOperations, setOpenOperations] = useState<Record<string, boolean>>({});
  const [bodies, setBodies] = useState<Record<string, string>>({});
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const visibleTables = useMemo(() => {
    const query = filter.trim().toLocaleLowerCase('vi-VN');
    return query ? tableDefinitions.filter((table) => `${table.name} ${table.label} ${table.group}`.toLocaleLowerCase('vi-VN').includes(query)) : tableDefinitions;
  }, [filter]);

  const toggleTable = (tableName: string) => setOpenTables((current) => ({ ...current, [tableName]: !current[tableName] }));
  const toggleOperation = (table: TableMeta, method: HttpMethod) => {
    const operationKey = `${table.name}-${method}`;
    setOpenOperations((current) => ({ ...current, [operationKey]: !current[operationKey] }));
    if (method !== 'GET' && bodies[operationKey] === undefined) setBodies((current) => ({ ...current, [operationKey]: emptyBody(table, method) }));
  };

  const executeOperation = async (table: TableMeta, method: HttpMethod) => {
    const operationKey = `${table.name}-${method}`;
    setLoading((current) => ({ ...current, [operationKey]: true }));
    setError('');
    try {
      let result: unknown;
      if (method === 'GET') {
        result = await apiFetch<TableResponse>(`/admin/tables/${table.name}?limit=100`);
      } else {
        const procedureName = table.procedures?.[method];
        if (!procedureName) throw new Error('Bảng này chưa có Stored Procedure CRUD trong backend.');
        let body: Record<string, unknown>;
        try { body = JSON.parse(bodies[operationKey] || '{}') as Record<string, unknown>; } catch { throw new Error('Request body phải là JSON hợp lệ.'); }
        result = await apiFetch(`/admin/procedures/${procedureName}`, { method, body: JSON.stringify(body) });
      }
      setResponses((current) => ({ ...current, [operationKey]: prettyJson(result) }));
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Không thể gọi API.';
      setResponses((current) => ({ ...current, [operationKey]: prettyJson({ error: message }) }));
      setError(message);
    } finally { setLoading((current) => ({ ...current, [operationKey]: false })); }
  };

  return (
    <div className={styles.page}>
      <Head><title>Swagger API | WebXe</title></Head>
      <header className={styles.header}>
        <div className={styles.brandBlock}><div className={styles.swaggerMark}><span>✦</span> WEBXE API EXPLORER</div><h1>Quản lý dữ liệu API</h1><p>Swagger-style workspace cho toàn bộ bảng dữ liệu WebXe.</p></div>
        <div className={styles.headerActions}><span className={styles.live}><i /> API đang hoạt động</span><Link className={styles.backButton} href="/DatabaseDashboard/DatabaseDashboard">Dashboard</Link></div>
      </header>
      <main className={styles.content}>
        <section className={styles.overview}><div><span className={styles.overline}>OpenAPI 3.0.3</span><h2>WebXe Backend API</h2><p>Thử nghiệm trực tiếp các thao tác đọc và CRUD. Endpoint yêu cầu tài khoản quản trị viên.</p></div><div className={styles.stats}><strong>{tableDefinitions.length}</strong><span>bảng dữ liệu</span><strong>4</strong><span>HTTP methods</span></div></section>
        <div className={styles.toolbar}><label className={styles.search}><span>⌕</span><input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Lọc theo tên bảng hoặc nhóm..." /></label><span className={styles.counter}>{visibleTables.length} / {tableDefinitions.length} bảng</span></div>
        {error && <div className={styles.globalError}>{error}</div>}
        <section className={styles.apiList} aria-label="Danh sách API theo bảng">
          {visibleTables.map((table) => {
            const isTableOpen = openTables[table.name];
            return <article className={styles.tableGroup} key={table.name}>
              <button className={styles.tableSummary} onClick={() => toggleTable(table.name)} aria-expanded={isTableOpen}><span className={`${styles.chevron} ${isTableOpen ? styles.chevronOpen : ''}`}>⌄</span><span className={styles.tableIcon}>▦</span><span className={styles.tableTitle}><strong>{table.name}</strong><small>{table.label} · {table.group}</small></span><span className={styles.routeHint}>/api/data/{table.name}</span><span className={styles.keyHint}>PK: {table.key}</span></button>
              {isTableOpen && <div className={styles.operations}>{methods.map((method) => {
                const operationKey = `${table.name}-${method}`;
                const isOpen = openOperations[operationKey];
                const isSupported = method === 'GET' || Boolean(table.procedures?.[method]);
                const endpoint = method === 'GET' ? `/api/admin/tables/${table.name}` : `/api/admin/procedures/${table.procedures?.[method] || 'chưa-cấu-hình'}`;
                return <div className={`${styles.operation} ${styles[method.toLowerCase()]} ${!isSupported ? styles.unsupported : ''}`} key={method}>
                  <button className={styles.operationBar} onClick={() => toggleOperation(table, method)} aria-expanded={isOpen}><span className={styles.method}>{method}</span><code>{endpoint}</code><span className={styles.operationTitle}>{methodInfo[method].title}</span><span className={styles.operationArrow}>{isOpen ? '⌃' : '⌄'}</span></button>
                  {isOpen && <div className={styles.operationBody}><p>{methodInfo[method].description} {method === 'GET' ? 'Giới hạn mặc định 100 bản ghi.' : `Procedure: ${table.procedures?.[method] || 'chưa cấu hình'}.`}</p>{!isSupported && <div className={styles.notice}>Backend chưa có Stored Procedure cho thao tác này.</div>}{method !== 'GET' && isSupported && <label className={styles.requestField}><span>Request body <b>application/json</b></span><textarea value={bodies[operationKey] ?? emptyBody(table, method)} onChange={(event) => setBodies((current) => ({ ...current, [operationKey]: event.target.value }))} spellCheck={false} /></label>}<div className={styles.actionRow}><button className={styles.tryButton} disabled={!isSupported || loading[operationKey]} onClick={() => void executeOperation(table, method)}>{loading[operationKey] ? 'Đang gọi...' : 'Try it out'}</button><code>{method}</code></div>{responses[operationKey] && <pre className={styles.response}><span>Response</span>{responses[operationKey]}</pre>}</div>}
                </div>;
              })}</div>}
            </article>;
          })}
        </section>
      </main>
    </div>
  );
}
