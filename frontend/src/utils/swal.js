/**
 * swal.js — SweetAlert2 themed helpers using RCEE RIMS orange brand colours
 */
import Swal from 'sweetalert2';

const BASE = {
    customClass: {
        popup:         'swal-rcee-popup',
        title:         'swal-rcee-title',
        confirmButton: 'swal-rcee-confirm',
        cancelButton:  'swal-rcee-cancel',
        icon:          'swal-rcee-icon',
    },
    buttonsStyling: false,
    showClass:  { popup:  'animate__animated animate__fadeInDown animate__faster' },
    hideClass:  { popup:  'animate__animated animate__fadeOut animate__faster' },
};

// One-time style injection (idempotent)
let injected = false;
function injectStyles() {
    if (injected) return;
    injected = true;
    const style = document.createElement('style');
    style.textContent = `
        .swal-rcee-popup {
            border-radius: 20px !important;
            font-family: 'Inter', sans-serif !important;
            border: 1px solid #fed7aa !important;
            box-shadow: 0 20px 60px rgba(234,88,12,0.2) !important;
        }
        .swal-rcee-title {
            color: #1c1917 !important;
            font-weight: 700 !important;
            font-size: 1.1rem !important;
        }
        .swal-rcee-confirm {
            background: linear-gradient(135deg,#ea580c,#f97316) !important;
            color: #fff !important;
            border: none !important;
            border-radius: 10px !important;
            padding: 10px 22px !important;
            font-weight: 600 !important;
            font-size: 0.875rem !important;
            cursor: pointer !important;
            transition: all .2s !important;
            box-shadow: 0 4px 14px rgba(234,88,12,0.3) !important;
        }
        .swal-rcee-confirm:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 6px 20px rgba(234,88,12,0.45) !important;
        }
        .swal-rcee-cancel {
            background: #fff !important;
            color: #57534e !important;
            border: 1px solid #e7e5e4 !important;
            border-radius: 10px !important;
            padding: 10px 22px !important;
            font-weight: 600 !important;
            font-size: 0.875rem !important;
            cursor: pointer !important;
            transition: all .2s !important;
        }
        .swal-rcee-cancel:hover {
            background: #fafaf9 !important;
            border-color: #fed7aa !important;
        }
        .swal2-actions { gap: 10px !important; }
        .swal2-html-container { color: #78716c !important; font-size: 0.875rem !important; }
    `;
    document.head.appendChild(style);
}

/** Danger confirm (delete, remove, etc.) */
export const confirmDelete = async ({ title = 'Are you sure?', text = 'This action cannot be undone.', confirmText = 'Yes, Delete' } = {}) => {
    injectStyles();
    const result = await Swal.fire({
        ...BASE,
        title,
        text,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        iconColor: '#ea580c',
    });
    return result.isConfirmed;
};

/** Success toast (top-end, no confirm needed) */
export const swalSuccess = (title, text = '') => {
    injectStyles();
    Swal.fire({
        ...BASE,
        title,
        text,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
        iconColor: '#f97316',
    });
};

/** Generic info confirm */
export const confirmAction = async ({ title, text, confirmText = 'Proceed', icon = 'question' } = {}) => {
    injectStyles();
    const result = await Swal.fire({
        ...BASE,
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonText: confirmText,
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        iconColor: '#f97316',
    });
    return result.isConfirmed;
};

export default Swal;
