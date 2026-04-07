import Swal from 'sweetalert2';

export const useSweetAlert = () => {
  const success = (
    title: string,
    message?: string,
    onConfirm?: () => void
  ) => {
    Swal.fire({
      icon: 'success',
      title: title,
      text: message || '',
      confirmButtonText: 'OK',
      confirmButtonColor: '#059669',
      didClose: () => onConfirm?.(),
    });
  };

  const error = (
    title: string,
    message?: string,
    onConfirm?: () => void
  ) => {
    Swal.fire({
      icon: 'error',
      title: title,
      text: message || '',
      confirmButtonText: 'OK',
      confirmButtonColor: '#dc2626',
      didClose: () => onConfirm?.(),
    });
  };

  const warning = (
    title: string,
    message?: string,
    onConfirm?: () => void
  ) => {
    Swal.fire({
      icon: 'warning',
      title: title,
      text: message || '',
      confirmButtonText: 'OK',
      confirmButtonColor: '#f59e0b',
      didClose: () => onConfirm?.(),
    });
  };

  const info = (
    title: string,
    message?: string,
    onConfirm?: () => void
  ) => {
    Swal.fire({
      icon: 'info',
      title: title,
      text: message || '',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b82f6',
      didClose: () => onConfirm?.(),
    });
  };

  const confirm = async (
    title: string,
    message?: string,
    confirmButtonText: string = 'Ya',
    cancelButtonText: string = 'Batal'
  ): Promise<boolean> => {
    const result = await Swal.fire({
      icon: 'question',
      title: title,
      text: message || '',
      showCancelButton: true,
      confirmButtonText: confirmButtonText,
      cancelButtonText: cancelButtonText,
      confirmButtonColor: '#059669',
      cancelButtonColor: '#6b7280',
    });
    return result.isConfirmed;
  };

  const loading = (title: string = 'Memproses...') => {
    Swal.fire({
      title: title,
      allowOutsideClick: false,
      didOpen: async () => {
        Swal.showLoading();
      },
    });
  };

  const close = () => {
    Swal.close();
  };

  return {
    success,
    error,
    warning,
    info,
    confirm,
    loading,
    close,
  };
};
