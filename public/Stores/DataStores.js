import { writable } from 'svelte/store';

// 1. localStorage'dan ma'lumotlarni o'qib olish funksiyasi
const initialStudents = JSON.parse(localStorage.getItem('crm_students')) || [
  { id: 1, name: 'Anvar Toshov', group: 'FN-102' },
  { id: 2, name: 'Jasur Bekov', group: 'FN-102' },
  { id: 3, name: 'Nigora Karimova', group: 'FN-102' },
  { id: 4, name: 'Sardor Karimov', group: 'PY-201' },
  { id: 5, name: 'Malika Zokirova', group: 'PY-201' }
];

// 2. Writable store yaratamiz
export const studentsStore = writable(initialStudents);

// 3. Store o'zgarganda avtomatik localStorage'ga saqlash
studentsStore.subscribe((value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('crm_students', JSON.stringify(value));
  }
});

// Davomat uchun store (xohlasangiz buni ham saqlab qo'yishingiz mumkin)
const initialAttendance = JSON.parse(localStorage.getItem('crm_attendance')) || {};
export const attendanceStore = writable(initialAttendance);

attendanceStore.subscribe((value) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('crm_attendance', JSON.stringify(value));
  }
});