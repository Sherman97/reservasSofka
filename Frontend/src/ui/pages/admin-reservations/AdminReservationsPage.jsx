import React, { useEffect, useState } from 'react';
import { ReservationStatusFilter } from '../../components/admin-reservations/ReservationStatusFilter';
import {
    AdminCreateReservationPanel,
    CREATE_RESERVATION_SUCCESS_MESSAGE,
} from '../../components/admin-reservations/AdminCreateReservationPanel';
import {
    useAdminReservationFilters,
    ADMIN_RESERVATION_DEFAULT_FILTERS,
} from '../../../core/adapters/hooks/useAdminReservationFilters';
import { useAdminCreateReservationForm } from '../../../core/adapters/hooks/useAdminCreateReservationForm';
import {
    getAdminReservations,
    getAdminReservationDetail,
    searchAdminUsers,
    checkAdminReservationAvailability,
    createAdminReservation,
    getAdminCities,
    getAdminSpacesByCity,
    getAdminEquipmentByCity,
} from '../../../features/reservations/services/adminReservationsService';
import '../../styles/admin/AdminReservations.css';

const ADMIN_PAGE_SIZE = 20;
const ADMIN_SORT = { sortBy: 'executionDate', sortDirection: 'desc' };
const ADMIN_SITE_OPTIONS = [
    'Sede Medellin',
    'Sede Bogota',
    'Sede Medellín',
    'Sede Bogotá',
    'Sede MedellÃ­n',
    'Sede BogotÃ¡',
];

const ADMIN_SITE_FILTER_OPTIONS = ADMIN_SITE_OPTIONS.filter((site) => !/[Ãâ]/.test(site));

const buildReservationsQuery = (page, filters) => ({
    page,
    pageSize: ADMIN_PAGE_SIZE,
    ...ADMIN_SORT,
    filters,
});

const buildAvailabilityRequest = (form) => ({
    cityId: form.site,
    spaceId: form.space,
    date: form.date,
    startTime: form.startTime,
    endTime: form.endTime,
});

const buildCreateReservationRequest = (form) => ({
    userId: form.userId,
    cityId: form.site,
    spaceId: form.space,
    date: form.date,
    startTime: form.startTime,
    endTime: form.endTime,
    attendeesCount: form.attendeesCount,
    equipmentIds: (form.equipment || []).map((equipment) => equipment.itemId),
});

const getVisiblePages = (currentPage, totalPages) => {
    if (totalPages <= 0) return [];

    const pages = [currentPage];
    if (currentPage - 1 >= 1) pages.unshift(currentPage - 1);
    if (currentPage - 2 >= 1) pages.unshift(currentPage - 2);
    if (currentPage + 1 <= totalPages) pages.push(currentPage + 1);
    if (currentPage + 2 <= totalPages) pages.push(currentPage + 2);

    if (!pages.includes(1)) pages.unshift(1);
    if (!pages.includes(totalPages)) pages.push(totalPages);

    return [...new Set(pages)].sort((a, b) => a - b);
};

const buildDetailForm = (detail) => ({
    requesterQuery: detail?.userName || '',
    userId: detail?.userId || '',
    site: detail?.siteId || '',
    space: detail?.spaceId || '',
    date: detail?.executionDate || '',
    startTime: detail?.startTime || '',
    endTime: detail?.endTime || '',
    attendeesCount: detail?.attendeesCount || 1,
    equipment: detail?.equipment || [],
});

const safeText = (value) => (value ?? '');

const AdminReservationsFilters = ({
    filters,
    cityOptions,
    userOptions,
    loadingUsers,
    setFilter,
    clearFilters,
    applyFilters,
}) => (
    <section className="admin-filters-card">
        <div className="admin-filter-field">
            <label htmlFor="admin-filter-from">Desde</label>
            <input
                id="admin-filter-from"
                type="date"
                value={filters.from}
                onChange={(event) => setFilter('from', event.target.value)}
            />
        </div>

        <div className="admin-filter-field">
            <label htmlFor="admin-filter-to">Hasta</label>
            <input
                id="admin-filter-to"
                type="date"
                value={filters.to}
                onChange={(event) => setFilter('to', event.target.value)}
            />
        </div>

        <ReservationStatusFilter
            value={filters.status}
            onChange={(value) => setFilter('status', value)}
            label="Estado"
            includeEmptyOption
        />

        <div className="admin-filter-field">
            <label htmlFor="admin-filter-site">Sede</label>
            <select
                id="admin-filter-site"
                value={filters.site}
                onChange={(event) => setFilter('site', event.target.value)}
            >
                <option value="">Todas las sedes</option>
                {cityOptions.map((siteOption) => (
                    <option key={siteOption.value} value={siteOption.value}>{siteOption.label}</option>
                ))}
            </select>
        </div>

        <div className="admin-filter-field">
            <label htmlFor="admin-filter-user">Usuario</label>
            <select
                id="admin-filter-user"
                value={filters.user}
                onChange={(event) => setFilter('user', event.target.value)}
            >
                <option value="">
                    {loadingUsers ? 'Cargando usuarios...' : 'Todos los usuarios'}
                </option>
                {userOptions.map((userOption) => (
                    <option key={userOption.id} value={userOption.id}>
                        {userOption.label}
                    </option>
                ))}
            </select>
        </div>

        <div className="admin-filter-actions">
            <button type="button" className="admin-btn admin-btn-secondary" onClick={clearFilters}>Limpiar</button>
            <button type="button" className="admin-btn admin-btn-primary" onClick={applyFilters}>Aplicar filtros</button>
        </div>
    </section>
);

const AdminReservationsTable = ({
    reservations,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    onPageChange,
    onViewDetail,
}) => {
    if (reservations.length === 0) {
        return (
            <div className="admin-empty-state">
                <h3>No se encontraron reservas con los filtros aplicados</h3>
                <p>Prueba ajustando fechas, sede, estado o el usuario buscado.</p>
            </div>
        );
    }

    const visiblePages = getVisiblePages(currentPage, totalPages);
    const fromRow = totalItems === 0 ? 0 : ((currentPage - 1) * pageSize) + 1;
    const toRow = Math.min(currentPage * pageSize, totalItems);
    const canGoPrev = currentPage > 1;
    const canGoNext = currentPage < totalPages;

    return (
        <div className="admin-table-card">
            <table className="admin-reservations-table">
                <thead>
                    <tr>
                        <th>ID reserva</th>
                        <th>Usuario</th>
                        <th>Sede</th>
                        <th>Espacio</th>
                        <th>Fecha</th>
                        <th>Hora inicio</th>
                        <th>Hora fin</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {reservations.map((reservation) => (
                        <tr key={reservation.id}>
                            <td>{safeText(reservation.id)}</td>
                            <td>{safeText(reservation.userName)}</td>
                            <td>{safeText(reservation.site)}</td>
                            <td>{safeText(reservation.space)}</td>
                            <td>{safeText(reservation.executionDate)}</td>
                            <td>{safeText(reservation.startTime)}</td>
                            <td>{safeText(reservation.endTime)}</td>
                            <td>
                                <span className={`admin-status-badge status-${String(reservation.status || '').toLowerCase()}`}>
                                    {safeText(reservation.status)}
                                </span>
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className="admin-row-action"
                                    onClick={() => onViewDetail(reservation.id)}
                                >
                                    {`Ver detalle ${reservation.id}`}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="admin-pagination">
                <p className="admin-pagination-summary">
                    Mostrando {fromRow}-{toRow} de {totalItems} reservas
                </p>

                <div className="admin-pagination-controls">
                    <button
                        type="button"
                        className="admin-page-btn"
                        disabled={!canGoPrev}
                        onClick={() => onPageChange(currentPage - 1)}
                    >
                        Anterior
                    </button>

                    {visiblePages.map((pageNumber) => (
                        <button
                            key={pageNumber}
                            type="button"
                            className={`admin-page-btn ${pageNumber === currentPage ? 'active' : ''}`}
                            onClick={() => onPageChange(pageNumber)}
                            aria-current={pageNumber === currentPage ? 'page' : undefined}
                        >
                            {pageNumber}
                        </button>
                    ))}

                    <button
                        type="button"
                        className="admin-page-btn"
                        disabled={!canGoNext}
                        onClick={() => onPageChange(currentPage + 1)}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AdminReservationsPage = () => {
    const [appliedFilters, setAppliedFilters] = useState(ADMIN_RESERVATION_DEFAULT_FILTERS);
    const [currentPage, setCurrentPage] = useState(1);
    const [reservations, setReservations] = useState([]);
    const [pagination, setPagination] = useState({
        totalItems: 0,
        totalPages: 0,
        pageSize: ADMIN_PAGE_SIZE,
    });
    const [reservationDetail, setReservationDetail] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [userSuggestions, setUserSuggestions] = useState([]);
    const [createSuccessMessage, setCreateSuccessMessage] = useState('');
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const [cityOptions, setCityOptions] = useState([]);
    const [spaceOptions, setSpaceOptions] = useState([]);
    const [loadingCities, setLoadingCities] = useState(false);
    const [loadingSpaces, setLoadingSpaces] = useState(false);
    const [equipmentOptions, setEquipmentOptions] = useState([]);
    const [loadingEquipment, setLoadingEquipment] = useState(false);
    const [filterUserOptions, setFilterUserOptions] = useState([]);
    const [loadingFilterUsers, setLoadingFilterUsers] = useState(false);

    const { filters, validationError, setFilter, applyFilters, clearFilters } = useAdminReservationFilters({
        onApply: (nextFilters) => {
            setCurrentPage(1);
            setAppliedFilters(nextFilters);
        },
    });
    const createReservationForm = useAdminCreateReservationForm({ requireUserSelection: true });

    useEffect(() => {
        const loadReservations = async () => {
            const response = await getAdminReservations(buildReservationsQuery(currentPage, appliedFilters));
            const items = response?.items || [];
            setReservations(items);
            setPagination({
                totalItems: Number(response?.total ?? 0),
                totalPages: Number(response?.totalPages ?? (items.length > 0 ? 1 : 0)),
                pageSize: Number(response?.pageSize ?? ADMIN_PAGE_SIZE),
            });
        };

        loadReservations();
    }, [appliedFilters, currentPage]);

    useEffect(() => {
        if (!toast.message) return undefined;
        const timer = setTimeout(() => setToast({ message: '', type: 'success' }), 3000);
        return () => clearTimeout(timer);
    }, [toast.message]);

    useEffect(() => {
        const loadCities = async () => {
            setLoadingCities(true);
            const cities = await getAdminCities();
            const normalizedCities = Array.isArray(cities) ? cities : [];
            setCityOptions(normalizedCities.map((city) => ({
                value: city.id,
                label: city.name,
            })));
            setLoadingCities(false);
        };
        loadCities();
    }, []);

    useEffect(() => {
        const loadFilterUsers = async () => {
            setLoadingFilterUsers(true);
            const users = await searchAdminUsers('');
            const normalizedUsers = Array.isArray(users) ? users : [];
            setFilterUserOptions(
                normalizedUsers
                    .map((user) => ({
                        id: user.id,
                        label: user.fullName
                            ? `${user.fullName} (${user.email})`
                            : user.email,
                    }))
                    .filter((user) => user.id && user.label),
            );
            setLoadingFilterUsers(false);
        };

        loadFilterUsers();
    }, []);

    useEffect(() => {
        const cityId = createReservationForm.form.site;
        if (!cityId) {
            return;
        }

        const loadSpaces = async () => {
            setLoadingSpaces(true);
            const spaces = await getAdminSpacesByCity(cityId);
            const normalizedSpaces = Array.isArray(spaces) ? spaces : [];
            setSpaceOptions(normalizedSpaces.map((space) => ({
                value: space.id,
                label: space.name,
            })));
            setLoadingSpaces(false);
        };

        loadSpaces();
    }, [createReservationForm.form.site]);

    useEffect(() => {
        const cityId = createReservationForm.form.site;
        if (!cityId) {
            return;
        }

        const loadEquipment = async () => {
            setLoadingEquipment(true);
            const equipment = await getAdminEquipmentByCity(cityId);
            const normalized = Array.isArray(equipment) ? equipment : [];
            setEquipmentOptions(normalized);
            setLoadingEquipment(false);
        };

        loadEquipment();
    }, [createReservationForm.form.site]);

    const handleViewDetail = async (reservationId) => {
        const detail = await getAdminReservationDetail(reservationId);
        setReservationDetail(detail);
        setIsDetailModalOpen(Boolean(detail));
    };

    const closeDetailModal = () => {
        setIsDetailModalOpen(false);
        setReservationDetail(null);
    };

    const openCreateModal = () => {
        createReservationForm.resetForm();
        createReservationForm.validateForm();
        setCreateSuccessMessage('');
        setUserSuggestions([]);
        setIsCreateModalOpen(true);
    };

    const closeCreateModal = () => {
        setIsCreateModalOpen(false);
        setUserSuggestions([]);
    };

    const handleCreateFieldChange = (field, value) => {
        if (field === 'site') {
            createReservationForm.setField('site', value);
            createReservationForm.setField('space', '');
            setSpaceOptions([]);
            setEquipmentOptions([]);
            return;
        }
        createReservationForm.setField(field, value);
    };

    const handleUserSearch = async (query) => {
        createReservationForm.setField('requesterQuery', query);

        if (!query?.trim()) {
            setUserSuggestions([]);
            return;
        }

        const suggestions = await searchAdminUsers(query);
        setUserSuggestions(suggestions || []);
    };

    const handleCreateReservation = async (event) => {
        event.preventDefault();
        setCreateSuccessMessage('');

        if (!createReservationForm.validateForm()) {
            setToast({
                message: 'Completa los campos obligatorios antes de crear la reserva',
                type: 'error',
            });
            return;
        }

        try {
            const availability = await checkAdminReservationAvailability(
                buildAvailabilityRequest(createReservationForm.form),
            );

            if (availability?.hasConflict) {
                createReservationForm.setHasConflict(true);
                setToast({
                    message: 'El espacio seleccionado ya se encuentra reservado en este horario',
                    type: 'error',
                });
                return;
            }

            createReservationForm.setHasConflict(false);
            await createAdminReservation(buildCreateReservationRequest(createReservationForm.form));
            setToast({ message: CREATE_RESERVATION_SUCCESS_MESSAGE, type: 'success' });
            closeCreateModal();
            const response = await getAdminReservations(buildReservationsQuery(currentPage, appliedFilters));
            const items = response?.items || [];
            setReservations(items);
            setPagination({
                totalItems: Number(response?.total ?? 0),
                totalPages: Number(response?.totalPages ?? (items.length > 0 ? 1 : 0)),
                pageSize: Number(response?.pageSize ?? ADMIN_PAGE_SIZE),
            });
        } catch (error) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'No fue posible crear la reserva. Intenta de nuevo.';
            setToast({ message, type: 'error' });
        }
    };

    return (
        <div className="admin-reservations-page">
            <div className="container">
                <div className="admin-page-header">
                    <div>
                        <h1>Gestion de Reservas</h1>
                        <p>Administra reservas activas e historial por sede y usuario.</p>
                    </div>
                    <button type="button" className="admin-btn admin-btn-primary" onClick={openCreateModal}>
                        Nueva reserva
                    </button>
                </div>

                {toast.message && (
                    <div
                        role="status"
                        aria-live="polite"
                        className={`admin-toast ${toast.type === 'error' ? 'admin-toast-error' : 'admin-toast-success'}`}
                    >
                        <span className="admin-toast-icon">{toast.type === 'error' ? '!' : 'OK'}</span>
                        <span>{toast.message}</span>
                    </div>
                )}

                {!isCreateModalOpen && (
                    <>
                        <AdminReservationsFilters
                            filters={filters}
                            cityOptions={
                                cityOptions.length > 0
                                    ? cityOptions
                                    : ADMIN_SITE_FILTER_OPTIONS.map((siteName, index) => ({
                                        value: String(index + 1),
                                        label: siteName,
                                    }))
                            }
                            userOptions={filterUserOptions}
                            loadingUsers={loadingFilterUsers}
                            setFilter={setFilter}
                            clearFilters={clearFilters}
                            applyFilters={applyFilters}
                        />
                        {validationError && <p className="admin-inline-alert">{validationError}</p>}
                        <AdminReservationsTable
                            reservations={reservations}
                            currentPage={currentPage}
                            totalPages={pagination.totalPages}
                            totalItems={pagination.totalItems}
                            pageSize={pagination.pageSize}
                            onPageChange={(page) => setCurrentPage(page)}
                            onViewDetail={handleViewDetail}
                        />
                    </>
                )}

                <AdminCreateReservationPanel
                    isOpen={isCreateModalOpen}
                    isAdmin
                    form={createReservationForm.form}
                    errors={createReservationForm.errors}
                    hasConflict={createReservationForm.hasConflict}
                    canSubmit={createReservationForm.canSubmit}
                    successMessage={createSuccessMessage}
                    cityOptions={cityOptions}
                    spaceOptions={spaceOptions}
                    loadingCities={loadingCities}
                    loadingSpaces={loadingSpaces}
                    userSuggestions={userSuggestions}
                    selectedEquipment={createReservationForm.form.equipment}
                    attendeesCount={createReservationForm.form.attendeesCount}
                    equipmentOptions={equipmentOptions}
                    loadingEquipment={loadingEquipment}
                    onUserSearch={handleUserSearch}
                    onUserSelect={(user) => {
                        createReservationForm.setSelectedUser(user);
                        setUserSuggestions([]);
                    }}
                    onFieldChange={handleCreateFieldChange}
                    onAttendeesCountChange={createReservationForm.setAttendeesCount}
                    onEquipmentToggle={createReservationForm.toggleEquipment}
                    onSubmit={handleCreateReservation}
                    onClose={closeCreateModal}
                />

                <AdminCreateReservationPanel
                    isOpen={isDetailModalOpen}
                    mode="detail"
                    isAdmin
                    readOnly
                    title="Detalle de reserva"
                    subtitle={`Reserva ${reservationDetail?.id || ''} - ${reservationDetail?.status || ''} - ${reservationDetail?.userEmail || ''}`}
                    form={buildDetailForm(reservationDetail)}
                    errors={{}}
                    hasConflict={false}
                    canSubmit={false}
                    successMessage=""
                    cityOptions={
                        reservationDetail?.siteId
                            ? [{ value: reservationDetail.siteId, label: reservationDetail.site || reservationDetail.siteId }]
                            : []
                    }
                    spaceOptions={
                        reservationDetail?.spaceId
                            ? [{ value: reservationDetail.spaceId, label: reservationDetail.space || reservationDetail.spaceId }]
                            : []
                    }
                    loadingCities={false}
                    loadingSpaces={false}
                    userSuggestions={[]}
                    selectedEquipment={reservationDetail?.equipment || []}
                    attendeesCount={reservationDetail?.attendeesCount || 1}
                    equipmentOptions={reservationDetail?.equipmentOptions || []}
                    loadingEquipment={false}
                    onUserSearch={() => {}}
                    onUserSelect={() => {}}
                    onFieldChange={() => {}}
                    onAttendeesCountChange={() => {}}
                    onEquipmentToggle={() => {}}
                    onSubmit={(event) => event.preventDefault()}
                    onClose={closeDetailModal}
                />
            </div>
        </div>
    );
};

export default AdminReservationsPage;
