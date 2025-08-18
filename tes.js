const arr = `{
    "pembuat": [
        {
            "id": 6864,
            "jabatan": "AOS",
            "jenis": "all",
            "sebagai": "pembuat",
            "kategori": null,
            "nama": "Ningsih Dorlina",
            "path": null,
            "no_doc": "0083/P191/MANADO/VII/2025-MTI",
            "no_pengadaan": null,
            "status": 1,
            "no_set": null,
            "recent": null,
            "struktur": "pengirim",
            "id_role": 5,
            "way_app": null,
            "createdAt": "2025-07-09T07:39:18.000Z",
            "updatedAt": "2025-07-09T07:39:18.000Z"
        }
    ],
    "penerima": [
        {
            "id": 6870,
            "jabatan": "AOS",
            "jenis": "all",
            "sebagai": "penerima",
            "kategori": null,
            "nama": null,
            "path": null,
            "no_doc": "0083/P191/MANADO/VII/2025-MTI",
            "no_pengadaan": null,
            "status": null,
            "no_set": null,
            "recent": null,
            "struktur": "penerima",
            "id_role": 5,
            "way_app": null,
            "createdAt": "2025-07-09T07:39:18.000Z",
            "updatedAt": "2025-07-09T07:39:18.000Z"
        }
    ],
    "pemeriksa": [
        {
            "id": 6865,
            "jabatan": "BM",
            "jenis": "all",
            "sebagai": "pemeriksa",
            "kategori": null,
            "nama": null,
            "path": null,
            "no_doc": "0083/P191/MANADO/VII/2025-MTI",
            "no_pengadaan": null,
            "status": null,
            "no_set": null,
            "recent": null,
            "struktur": "pengirim",
            "id_role": 12,
            "way_app": null,
            "createdAt": "2025-07-09T07:39:18.000Z",
            "updatedAt": "2025-07-09T07:39:18.000Z"
        },
        {
            "id": 6866,
            "jabatan": "ROM",
            "jenis": "all",
            "sebagai": "pemeriksa",
            "kategori": null,
            "nama": null,
            "path": null,
            "no_doc": "0083/P191/MANADO/VII/2025-MTI",
            "no_pengadaan": null,
            "status": null,
            "no_set": null,
            "recent": null,
            "struktur": "pengirim",
            "id_role": 7,
            "way_app": null,
            "createdAt": "2025-07-09T07:39:18.000Z",
            "updatedAt": "2025-07-09T07:39:18.000Z"
        },
        {
            "id": 6867,
            "jabatan": "GAAM",
            "jenis": "non-it",
            "sebagai": "pemeriksa",
            "kategori": null,
            "nama": null,
            "path": null,
            "no_doc": "0083/P191/MANADO/VII/2025-MTI",
            "no_pengadaan": null,
            "status": null,
            "no_set": null,
            "recent": null,
            "struktur": null,
            "id_role": 30,
            "way_app": null,
            "createdAt": "2025-07-09T07:39:18.000Z",
            "updatedAt": "2025-07-09T07:39:18.000Z"
        }
    ],
    "penyetuju": [
        {
            "id": 6868,
            "jabatan": "Head Of FA&Tax",
            "jenis": "all",
            "sebagai": "penyetuju",
            "kategori": null,
            "nama": null,
            "path": null,
            "no_doc": "0083/P191/MANADO/VII/2025-MTI",
            "no_pengadaan": null,
            "status": null,
            "no_set": null,
            "recent": null,
            "struktur": null,
            "id_role": 17,
            "way_app": null,
            "createdAt": "2025-07-09T07:39:18.000Z",
            "updatedAt": "2025-07-09T07:39:18.000Z"
        },
        {
            "id": 6869,
            "jabatan": "Head Of Ops",
            "jenis": "all",
            "sebagai": "penyetuju",
            "kategori": null,
            "nama": null,
            "path": null,
            "no_doc": "0083/P191/MANADO/VII/2025-MTI",
            "no_pengadaan": null,
            "status": null,
            "no_set": null,
            "recent": null,
            "struktur": null,
            "id_role": 20,
            "way_app": null,
            "createdAt": "2025-07-09T07:39:18.000Z",
            "updatedAt": "2025-07-09T07:39:18.000Z"
        }
    ]
}`

const conv = JSON.parse(arr)

const convArr = Object.values(conv)

const finObj = {
    ...conv,
    penerima: conv.penerima
}
const arrEx = [
    [
        {king: 'a'},
        {queen: 'b'}
    ],
    [
        {king: 'c'},
        {queen: 'd'}
    ],
    [
        {king: 'e'},
        {queen: 'f'}
    ]
]

console.log(arrEx.find(item => item.find(y => y.king === 'z')) === undefined)
