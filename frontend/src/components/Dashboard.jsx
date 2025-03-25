import React, { useState, useEffect } from "react";
import axios from "axios";

const Dashboard = () => {
    const [selectedMenu, setSelectedMenu] = useState("Americano");
    const [prediction, setPrediction] = useState(null);

    // State untuk menyimpan total akumulasi
    const [totalMenuTerjual, setTotalMenuTerjual] = useState(0);
    const [totalBahanBaku, setTotalBahanBaku] = useState(0);

    // State untuk menyimpan bulan dan tahun yang diprediksi
    const [bulanPrediksi, setBulanPrediksi] = useState("");
    const [tahunPrediksi, setTahunPrediksi] = useState("");

    // State untuk menyimpan total menu yang sudah diprediksi
    const [totalMenu, setTotalMenu] = useState(0);
    const [predictedMenus, setPredictedMenus] = useState([]);

    const handlePredict = async () => {
        try {
            const response = await axios.post("http://localhost:5000/predict", { menu: selectedMenu });
            console.log("API Response Data:", response.data);
            
            setPrediction(response.data);
            setBulanPrediksi(response.data.bulan_prediksi);
            setTahunPrediksi(response.data.tahun_prediksi);
    
            // Perbarui total menu terjual
            setTotalMenuTerjual(prevTotal => prevTotal + response.data.jumlah_terjual);
    
            // Perbarui total bahan baku
            const totalBahan = Object.values(response.data.bahan_baku).reduce((a, b) => a + b, 0);
            setTotalBahanBaku(prevTotal => prevTotal + totalBahan);
    
            // Cek apakah menu sudah ada dalam predictedMenus
            setPredictedMenus(prevMenus => {
                if (!prevMenus.includes(selectedMenu)) {
                    return [...prevMenus, selectedMenu]; // Tambahkan menu ke daftar
                }
                return prevMenus;
            });
    
        } catch (error) {
            console.error("Error fetching prediction:", error);
        }
    };
    
    // Perbarui total menu hanya ketika predictedMenus berubah
    useEffect(() => {
        setTotalMenu(predictedMenus.length);
    }, [predictedMenus]);

    return (
        <div className="flex flex-col p-5 w-full">
            <h1 className="text-xl font-medium">Selamat Datang!</h1>
            <h2 className="text-xl font-semibold">Dasbor Prediksi Warung Fotkop</h2>

            {/* Statistik */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-black text-yellow-500 p-4 rounded-2xl text-center md:text-left shadow-sm">
                    <p>Total Menu</p>
                    <h3 className="text-xl font-bold">{totalMenu}</h3>
                </div>
                <div className="bg-black text-yellow-500 p-4 rounded-2xl text-center md:text-left shadow-sm">
                    <p>Total Menu Terjual Bulan Depan</p>
                    <h3 className="text-xl font-bold">{totalMenuTerjual} Porsi</h3>
                </div>
                <div className="bg-black text-yellow-500 p-4 rounded-2xl text-center md:text-left shadow-sm">
                    <p>Total Bahan Baku Bulan Depan</p>
                    <h3 className="text-xl font-bold">{totalBahanBaku} gram/ml</h3>
                </div>
            </div>


            {/* Form Prediksi */}
            <div className="bg-white p-6 rounded-2xl mt-4 border border-slate-300 shadow-slate-400 shadow-sm">
                <h1 className="font-bold text-xl mb-2">Prediksi Kebutuhan Bahan Baku Bulan Depan</h1>
                <p className="text-sm text-gray-600 mb-3">
                    Berencana menyusun stok bahan baku lebih akurat? Gunakan fitur prediksi ini untuk memperkirakan kebutuhan bahan baku berdasarkan data penjualan sebelumnya. Cukup pilih menu dan periode waktu, lalu lihat hasilnya.
                </p>

                <label className="block text-base font-semibold text-black ml-1">Pilih Menu</label>
                <div className="relative w-full mt-2">
                    <select
                        className="w-full p-2 pr-12 pl-4 border border-slate-300 rounded-full appearance-none bg-white"
                        value={selectedMenu}
                        onChange={(e) => setSelectedMenu(e.target.value)}
                    >
                        <option>Americano</option>
                        <option>Garlic Fries</option>
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 text-gray-700"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
                
                <button
                    onClick={handlePredict}
                    className="w-full bg-yellow-500 text-black font-bold p-2 mt-4 rounded-full"
                >
                    Mulai Prediksi
                </button>
            </div>

            {/* Tabel Hasil Prediksi */}
            {prediction && (
                <div>
                    {/* Tabel Prediksi Penjualan */}
                    <div className="bg-white mt-6 p-6 rounded-2xl border border-slate-300 overflow-x-auto">
                        <h3 className="font-bold text-xl mb-2">Hasil Prediksi Penjualan Bulan {prediction.bulan_prediksi} {prediction.tahun_prediksi}</h3>
                        <table className="w-full border-collapse border border-gray-300">
                            <thead>
                                <tr className="bg-black text-white">
                                    <th className="p-2 text-yellow-500">Menu Warung Fotkop</th>
                                    <th className="p-2 text-yellow-500">Prediksi Terjual</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-2 text-center">{prediction.menu}</td>
                                    <td className="p-2 text-center">{prediction.jumlah_terjual} Porsi</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
            
                    {/* Tabel Kebutuhan Bahan Baku */}
                    {prediction.bahan_baku && Object.keys(prediction.bahan_baku).length > 0 && (
                        <div className="bg-white mt-6 p-6 rounded-2xl border border-slate-300 overflow-x-auto">
                            <h3 className="font-bold text-xl mb-2">Kebutuhan Bahan Baku Bulan {prediction.bulan_prediksi} {prediction.tahun_prediksi}</h3>
                            <table className="w-full border-collapse border border-gray-300">
                                <thead>
                                    <tr className="bg-black text-white">
                                        <th className="p-2 text-yellow-500">Bahan Baku</th>
                                        <th className="p-2 text-yellow-500">Jumlah Kebutuhan</th> 
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(prediction.bahan_baku).map(([key, value], index) => {
                                        // Menentukan satuan berdasarkan jenis bahan baku
                                        const unit = key.toLowerCase().includes("air") || key.toLowerCase().includes("minyak") ? "ml" : "gram";

                                        return (
                                            <tr key={key} className={index % 2 === 0 ? "bg-gray-200" : ""}>
                                                <td className="p-2 text-center">{key}</td>
                                                <td className="p-2 text-center">{value} {unit}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
