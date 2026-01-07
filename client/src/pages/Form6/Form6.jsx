import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import moment from "moment";
import toast from "react-hot-toast";
import "./Form6.css";
import { useLoading } from "../../context/LoadingContext";

export default function Form6() {
    const { showLoading, hideLoading } = useLoading();

    const [formData, setFormData] = useState({
        state: "", district: "", ac: "",
        firstName: "", surname: "", photo: null,
        relationType: "", relativeName: "", relativeSurname: "",
        mobile: "", email: "",
        aadhaar: "", noAadhaar: false,
        gender: "",
        dob: "", dobDocType: "", dobProof: null,
        houseNo: "", street: "", village: "", postOffice: "", pinCode: "", tehsil: "", districtP: "", stateP: "", addressDocType: "", addressProof: null,
        disabilityCat: "", disabilityPerc: "", disabilityCert: null,
        familyMemberName: "", familyRelation: "", familyEpic: "",
        declVillage: "", declState: "", declDistrict: "", declDate: new Date().toISOString().split('T')[0], declPlace: "",
        residentSince: "", ageProofSupport: ""
    });

    const [showPreview, setShowPreview] = useState(false);

    const [errors, setErrors] = useState({});
    const [submissionResult, setSubmissionResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [states, setStates] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [acs, setAcs] = useState([]);

    const [selectedStateCd, setSelectedStateCd] = useState("");
    const [selectedDistrictCd, setSelectedDistrictCd] = useState("");

    useEffect(() => {
        showLoading("Loading Form-6...");
        fetch(`${import.meta.env.VITE_API_BASE}/api/states`)
            .then(res => res.json())
            .then(data => setStates(Array.isArray(data) ? data : []))
            .catch(() => toast.error("Failed to load states"))
            .finally(() => hideLoading());
    }, []);

    useEffect(() => {
        if (selectedStateCd) {
            fetch(`${import.meta.env.VITE_API_BASE}/api/districts/${selectedStateCd}`)
                .then(res => res.json())
                .then(data => {
                    const list = Array.isArray(data) ? data : [];
                    setDistricts(list);
                    try { setDistrictsD(list); } catch (e) { }
                });
        }
    }, [selectedStateCd]);

    useEffect(() => {
        if (selectedDistrictCd) {
            fetch(`${import.meta.env.VITE_API_BASE}/api/acs/${selectedDistrictCd}`)
                .then(res => res.json())
                .then(data => setAcs(Array.isArray(data) ? data : []));
        }
    }, [selectedDistrictCd]);

    const [districtsP, setDistrictsP] = useState([]);
    const [districtsD, setDistrictsD] = useState([]);

    const d = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
        [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
        [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
        [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
        [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
        [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
        [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
        [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
        [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
    ];
    const p = [
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
        [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
        [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
        [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
        [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
        [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
        [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
    ];

    function validateVerhoeff(num) {
        let c = 0;
        let myArray = String(num).split("").map(Number).reverse();
        for (let i = 0; i < myArray.length; i++) {
            c = d[c][p[i % 8][myArray[i]]];
        }
        return c === 0;
    }

    const getQualifyingDate = () => {
        const today = moment();
        const year = today.year();
        if (today.isBefore(`${year}-01-01`)) return moment(`${year}-01-01`);
        if (today.isBefore(`${year}-04-01`)) return moment(`${year}-04-01`);
        if (today.isBefore(`${year}-07-01`)) return moment(`${year}-07-01`);
        if (today.isBefore(`${year}-10-01`)) return moment(`${year}-10-01`);
        return moment(`${year + 1}-01-01`);
    };

    const getMaxDob = () => {
        const qDate = getQualifyingDate();
        return qDate.clone().subtract(18, 'years').format('YYYY-MM-DD');
    };

    const handleDobChange = (e) => {
        const val = e.target.value;
        const dob = moment(val);
        const qDate = getQualifyingDate();
        const cutoffDate = qDate.clone().subtract(18, 'years');

        if (dob.isAfter(cutoffDate)) {
            setErrors(prev => ({ ...prev, dob: `Must be born on or before ${cutoffDate.format('MMM DD, YYYY')}` }));
        } else {
            setErrors(prev => ({ ...prev, dob: null }));
        }

        if (moment().diff(dob, 'years') > 125) {
            setErrors(prev => ({ ...prev, dob: "Age cannot generally exceed 125 years" }));
        }

        setFormData(prev => ({ ...prev, dob: val }));
    };

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));

        if (type === "file") {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else if (type === "checkbox") {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            if (name === "mobile") {
                const numericVal = value.replace(/\D/g, '');
                if (value !== numericVal) return;
                if (numericVal.length > 10) return;
                setFormData(prev => ({ ...prev, [name]: numericVal }));
                return;
            }
            if (name === "disabilityPerc") {
                let val = value.replace(/\D/g, '');
                if (val > 100) val = "100";
                setFormData(prev => ({ ...prev, [name]: val }));
                return;
            }
            const toTitleCase = (str) => {
                return str.replace(/\w\S*/g, (txt) => {
                    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
                });
            };
            const formattedValue = (type === 'email' || type === 'date') ? value : toTitleCase(value);
            setFormData(prev => {
                const newData = { ...prev, [name]: formattedValue };
                if (name === "village") {
                    newData.declVillage = formattedValue;
                }
                return newData;
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.state) newErrors.state = "State is required";
        if (!formData.district) newErrors.district = "District is required";
        if (!formData.ac) newErrors.ac = "Constituency is required";
        if (!formData.firstName) newErrors.firstName = "First Name is required";
        if (!formData.relationType) newErrors.relationType = "Relation Type is required";
        if (!formData.relativeName) newErrors.relativeName = "Relative Name is required";
        if (!formData.dob) newErrors.dob = "Date of Birth is required";
        if (formData.dob && errors.dob) newErrors.dob = errors.dob;
        if (!formData.gender) newErrors.gender = "Gender is required";

        if (!formData.houseNo) newErrors.houseNo = "House No is required";
        if (!formData.street) newErrors.street = "Street is required";
        if (!formData.village) newErrors.village = "Village is required";
        if (!formData.postOffice) newErrors.postOffice = "Post Office is required";
        if (!formData.pinCode) newErrors.pinCode = "PIN Code is required";
        else if (formData.pinCode.length !== 6) newErrors.pinCode = "PIN Code must be 6 digits";
        if (!formData.stateP) newErrors.stateP = "Address State is required";
        if (!formData.districtP) newErrors.districtP = "Address District is required";

        if (!formData.declState) newErrors.declState = "Declaration State is required";
        if (!formData.declDistrict) newErrors.declDistrict = "Declaration District is required";

        if (!formData.photo) newErrors.photo = "Photograph is required";
        if (!formData.dobProof) newErrors.dobProof = "DOB Proof is required";
        if (!formData.dobDocType) newErrors.dobDocType = "DOB Proof Type is required";
        if (!formData.addressProof) newErrors.addressProof = "Address Proof is required";
        if (!formData.addressDocType) newErrors.addressDocType = "Address Proof Type is required";
        if (formData.disabilityCat && formData.disabilityCat !== "None" && !formData.disabilityCert) {
            newErrors.disabilityCert = "Disability Certificate is required";
        }

        if (!formData.mobile) newErrors.mobile = "Mobile Number is required";
        else if (formData.mobile.length !== 10) newErrors.mobile = "Mobile must be 10 digits";

        if (!formData.noAadhaar && !formData.aadhaar) newErrors.aadhaar = "Aadhaar Number is required";
        if (formData.aadhaar && formData.aadhaar.length !== 12) newErrors.aadhaar = "Aadhaar must be 12 digits";
        if (!formData.tehsil) newErrors.tehsil = "Tehsil/Taluqa is required";

        if (!formData.declPlace) newErrors.declPlace = "Place is required";
        if (!formData.declVillage) newErrors.declVillage = "Village/Town is required";
        if (!formData.residentSince) newErrors.residentSince = "Resident Since date is required";

        if (formData.familyEpic) {
            const epicRegex = /^[A-Za-z]{3}[0-9]{8}$/;
            if (!epicRegex.test(formData.familyEpic)) {
                newErrors.familyEpic = "EPIC must be 3 Letters + 8 Numbers (e.g. ABC12345678)";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Please fill all required fields correctly.");
            return;
        }

        setShowPreview(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        showLoading("Submitting application...");
        const data = new FormData();
        for (const key in formData) {
            let value = formData[key];
            if ((key === "dob" || key === "declDate") && value) {
                value = moment(value).format('DD-MM-YYYY');
            }
            data.append(key, value);
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/register`, {
                method: "POST",
                body: data
            });
            const result = await res.json();
            if (result.success) {
                console.log("Submission success:", result.refNo);
                setSubmissionResult(result);
                setShowPreview(false);
            } else {
                toast.error(result.message || "Submission Failed");
            }
        } catch (err) {
            toast.error("Error submitting form");
        } finally {
            setIsSubmitting(false);
            hideLoading();
        }
    };

    const handleAddressStateChange = (e, stateField, districtField) => {
        const name = e.target.value;
        const code = states.find(s => s.stateName === name)?.stateCd;
        setFormData(prev => ({ ...prev, [stateField]: name, [districtField]: "" }));
        setErrors(prev => ({ ...prev, [stateField]: null, [districtField]: null }));
        if (code) {
            fetch(`${import.meta.env.VITE_API_BASE}/api/districts/${code}`)
                .then(res => res.json())
                .then(data => {
                    const list = Array.isArray(data) ? data : [];
                    if (districtField === 'districtP') setDistrictsP(list);
                    else if (districtField === 'declDistrict') setDistrictsD(list);
                });
        }
    };
    const handleAddressDistrictChange = (e, districtField) => {
        const name = e.target.value;
        setFormData(prev => ({ ...prev, [districtField]: name }));
        setErrors(prev => ({ ...prev, [districtField]: null }));
    };

    const handleStateChange = (e) => {
        const name = e.target.value;
        const code = states.find(s => s.stateName === name)?.stateCd;
        setSelectedStateCd(code); setSelectedDistrictCd("");
        setFormData(prev => ({ ...prev, state: name, district: "", ac: "", declState: name, declDistrict: "" }));
        setErrors(prev => ({ ...prev, state: null }));
    };
    const handleDistrictChange = (e) => {
        const name = e.target.value;
        const code = districts.find(d => d.districtValue === name)?.districtCd;
        setSelectedDistrictCd(code);
        setFormData(prev => ({ ...prev, district: name, ac: "", declDistrict: name }));
        setErrors(prev => ({ ...prev, district: null }));
    };
    const handleAcChange = (e) => {
        const name = e.target.value;
        setFormData(prev => ({ ...prev, ac: name }));
        setErrors(prev => ({ ...prev, ac: null }));
    };

    return (
        <div className="form6-page">
            <div className="form6-container">
                <h2 className="form6-title">Form 6 - New Voter Registration</h2>
                <p className="form6-subtitle">Election Commission of India</p>

                <form onSubmit={handleSubmit} encType="multipart/form-data" className="form-full-width">

                    <Section title="A. Select State, District & Assembly Constituency">
                        <p>To,</p>
                        <p>The Electoral Registration Officer,</p>
                        <div className="row">
                            <div className="col">
                                <label>State <span className="required-asterisk">*</span></label>
                                <select name="state" value={formData.state} onChange={handleStateChange} className={errors.state ? "input-error" : ""}>
                                    <option value="">Select State</option>
                                    {states.map(s => <option key={s.stateCd} value={s.stateName}>{s.stateName}</option>)}
                                </select>
                                {errors.state && <small className="error-text">{errors.state}</small>}
                            </div>
                            <div className="col">
                                <label>District <span className="required-asterisk">*</span></label>
                                <select name="district" value={formData.district} onChange={handleDistrictChange} className={errors.district ? "input-error" : ""}>
                                    <option value="">Select District</option>
                                    {districts.map(d => <option key={d.districtCd} value={d.districtValue}>{d.districtValue}</option>)}
                                </select>
                                {errors.district && <small className="error-text">{errors.district}</small>}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <label>Assembly Constituency <span className="required-asterisk">*</span></label>
                                <select name="ac" value={formData.ac} onChange={handleAcChange} className={errors.ac ? "input-error" : ""}>
                                    <option value="">Select AC</option>
                                    {acs.map(a => <option key={a.acId} value={a.asmblyName}>{a.asmblyNo} - {a.asmblyName}</option>)}
                                </select>
                                {errors.ac && <small className="error-text">{errors.ac}</small>}
                            </div>
                        </div>
                    </Section>

                    <Section title="B. Personal Details">
                        <div className="row">
                            <InputField label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} error={errors.firstName} required />
                            <InputField label="Surname" name="surname" value={formData.surname} onChange={handleChange} error={errors.surname} />
                        </div>
                        <div className="row">
                            <div className="col">
                                <label>Upload Photograph <span className="required-asterisk">*</span></label>
                                <input type="file" name="photo" accept=".jpg,.jpeg,.png" onChange={handleChange} className={errors.photo ? "input-error" : ""} />
                                {errors.photo && <small className="error-text">{errors.photo}</small>}
                            </div>
                        </div>
                    </Section>

                    <Section title="C. Name and Surname of Relative">
                        <div className="row">
                            <div className="col">
                                <label>Relation Type <span className="required-asterisk">*</span></label>
                                <select name="relationType" onChange={handleChange} className={errors.relationType ? "input-error" : ""}>
                                    <option value="">Select</option>
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Husband">Husband</option>
                                    <option value="Wife">Wife</option>
                                    <option value="Guardian">Legal Guardian</option>
                                </select>
                                {errors.relationType && <small className="error-text">{errors.relationType}</small>}
                            </div>
                        </div>
                        <div className="row">
                            <InputField label="Name" name="relativeName" value={formData.relativeName} onChange={handleChange} error={errors.relativeName} required />
                            <InputField label="Surname" name="relativeSurname" value={formData.relativeSurname} onChange={handleChange} error={errors.relativeSurname} />
                        </div>
                    </Section>

                    <Section title="D. Contact Details">
                        <div className="row">
                            <InputField label="Mobile Number" name="mobile" placeholder="10 Digit Mobile No" maxLength="10" inputMode="numeric" value={formData.mobile} onChange={handleChange} error={errors.mobile} required />
                            <InputField label="Email ID" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} />
                        </div>
                    </Section>

                    <Section title="E. Aadhaar Details">
                        <div className="row">
                            <div className="col">
                                <label><input type="checkbox" name="noAadhaar" onChange={handleChange} /> I am not able to furnish Aadhaar</label>
                            </div>
                        </div>
                        {!formData.noAadhaar && (
                            <div className="row">
                                <InputField label="Aadhaar Number" name="aadhaar" maxLength="12" placeholder="12 Digit Aadhaar" inputMode="numeric" value={formData.aadhaar} error={errors.aadhaar} success={errors.aadhaarValid && !errors.aadhaar ? "Aadhaar valid" : null} required onChange={(e) => {
                                    const val = e.target.value.replace(/\D/g, ''); e.target.value = val; handleChange(e);
                                    if (val.length === 0) {
                                        setErrors(prev => ({ ...prev, aadhaar: null, aadhaarValid: false }));
                                    } else if (val.length === 12) {
                                        if (!validateVerhoeff(val)) {
                                            setErrors(prev => ({ ...prev, aadhaar: "Invalid Aadhaar", aadhaarValid: false }));
                                        } else {
                                            setErrors(prev => ({ ...prev, aadhaar: null, aadhaarValid: true }));
                                        }
                                    } else {
                                        setErrors(prev => ({ ...prev, aadhaar: "Invalid Aadhaar", aadhaarValid: false }));
                                    }
                                }} />
                            </div>
                        )}
                    </Section>

                    <Section title="F. Gender">
                        <div className="row">
                            <div className="col" style={{ flexDirection: "column" }}>
                                <label>Gender <span className="required-asterisk">*</span></label>
                                <div style={{ display: "flex", gap: "20px" }}>
                                    <label className="radio-btns" style={{ display: "flex", alignItems: "center", gap: "5px" }}><input className="radio-btns" type="radio" name="gender" value="Male" onChange={handleChange} /> Male</label>
                                    <label className="radio-btns" style={{ display: "flex", alignItems: "center", gap: "5px" }}><input className="radio-btns" type="radio" name="gender" value="Female" onChange={handleChange} /> Female</label>
                                    <label className="radio-btns" style={{ display: "flex", alignItems: "center", gap: "5px" }}><input className="radio-btns" type="radio" name="gender" value="Third Gender" onChange={handleChange} /> Third Gender</label>
                                </div>
                                {errors.gender && <small className="error-text">{errors.gender}</small>}
                            </div>
                        </div>
                    </Section>

                    <Section title="G. Date of Birth Details">
                        <div className="row">
                            <div className="col">
                                <label>Date of Birth <span className="required-asterisk">*</span></label>
                                <input type="date" name="dob" max={getMaxDob()} onChange={handleDobChange} className={errors.dob ? "input-error" : ""} />
                                {errors.dob && <small className="error-text">{errors.dob}</small>}
                                <small style={{ color: "gray" }}>Must be 18 or above as of {getQualifyingDate().format('MMM DD, YYYY')}</small>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <label>Proof Document <span className="required-asterisk">*</span></label>
                                <select name="dobDocType" value={formData.dobDocType} onChange={handleChange} className={errors.dobDocType ? "input-error" : ""}>
                                    <option value="">Select Document</option>
                                    <option value="Birth Certificate">Birth Certificate</option>
                                    <option value="Aadhaar Card">Aadhaar Card</option>
                                    <option value="Pan Card">Pan Card</option>
                                    <option value="Driving License">Driving License</option>
                                    <option value="Class 10/12 Certificate">Class 10/12 Certificate</option>
                                    <option value="Indian Passport">Indian Passport</option>
                                </select>
                                {errors.dobDocType && <small className="error-text">{errors.dobDocType}</small>}
                            </div>
                            <div className="col">
                                <label>Upload Document <span className="required-asterisk">*</span></label>
                                <input type="file" name="dobProof" onChange={handleChange} className={errors.dobProof ? "input-error" : ""} />
                                {errors.dobProof && <small className="error-text">{errors.dobProof}</small>}
                            </div>
                        </div>
                    </Section>

                    <Section title="H. Present Address Details">
                        <div className="row">
                            <InputField label="House/Building No" name="houseNo" value={formData.houseNo} onChange={handleChange} error={errors.houseNo} required />
                            <InputField label="Street/Locality" name="street" value={formData.street} onChange={handleChange} error={errors.street} required />
                        </div>
                        <div className="row">
                            <InputField label="Village/Town" name="village" value={formData.village} onChange={handleChange} error={errors.village} required />
                            <InputField label="Post Office" name="postOffice" value={formData.postOffice} onChange={handleChange} error={errors.postOffice} required />
                        </div>
                        <div className="row">
                            <InputField label="PIN Code" name="pinCode" inputMode="numeric" maxLength="6" value={formData.pinCode} onChange={handleChange} error={errors.pinCode} required />
                            <InputField label="Tehsil/Taluqa" name="tehsil" value={formData.tehsil} onChange={handleChange} error={errors.tehsil} required />
                        </div>
                        <div className="row">
                            <div className="col">
                                <label>State <span className="required-asterisk">*</span></label>
                                <select name="stateP" value={formData.stateP} onChange={(e) => handleAddressStateChange(e, 'stateP', 'districtP')} className={errors.stateP ? "input-error" : ""}>
                                    <option value="">Select State</option>
                                    {states.map(s => <option key={s.stateCd} value={s.stateName}>{s.stateName}</option>)}
                                </select>
                                {errors.stateP && <small className="error-text">{errors.stateP}</small>}
                            </div>
                            <div className="col">
                                <label>District <span className="required-asterisk">*</span></label>
                                <select name="districtP" value={formData.districtP} onChange={(e) => handleAddressDistrictChange(e, 'districtP')} className={errors.districtP ? "input-error" : ""}>
                                    <option value="">Select District</option>
                                    {districtsP.map(d => <option key={d.districtCd} value={d.districtValue}>{d.districtValue}</option>)}
                                </select>
                                {errors.districtP && <small className="error-text">{errors.districtP}</small>}
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <label>Document for Proof of Residence <span className="required-asterisk">*</span></label>
                                <select name="addressDocType" value={formData.addressDocType} onChange={handleChange} className={errors.addressDocType ? "input-error" : ""}>
                                    <option value="">Select Document</option>
                                    <option value="Aadhaar Card">Aadhaar Card</option>
                                    <option value="Ration Card">Ration Card</option>
                                    <option value="Passport">Passport</option>
                                    <option value="Driving License">Driving License</option>
                                    <option value="Bank Passbook">Bank Passbook</option>
                                    <option value="Bill">Latest Water/Electricity/Gas Bill</option>
                                </select>
                                {errors.addressDocType && <small className="error-text">{errors.addressDocType}</small>}
                            </div>
                            <div className="col">
                                <label>Upload Address Proof <span className="required-asterisk">*</span></label>
                                <input type="file" name="addressProof" onChange={handleChange} className={errors.addressProof ? "input-error" : ""} />
                                {errors.addressProof && <small className="error-text">{errors.addressProof}</small>}
                            </div>
                        </div>
                    </Section>

                    <Section title="I. Category of Disability (Optional)">
                        <div className="row" style={{ alignItems: "flex-start" }}>
                            <div className="col">
                                <label>Category</label>
                                <select name="disabilityCat" onChange={handleChange}>
                                    <option value="">None</option>
                                    <option value="Locomotive">Locomotive</option>
                                    <option value="Visual">Visual</option>
                                    <option value="Hearing">Hearing</option>
                                </select>
                            </div>
                            <InputField label="Percentage %" name="disabilityPerc" type="text" inputMode="numeric" value={formData.disabilityPerc} onChange={handleChange} error={errors.disabilityPerc} maxLength={3} />
                            <div className="col">
                                <label>Certificate {(formData.disabilityCat && formData.disabilityCat !== "None") && <span className="required-asterisk">*</span>}</label>
                                <input type="file" name="disabilityCert" onChange={handleChange} className={errors.disabilityCert ? "input-error" : ""} />
                                {errors.disabilityCert && <small className="error-text">{errors.disabilityCert}</small>}
                            </div>
                        </div>
                    </Section>

                    <Section title="J. Family Member Details">
                        <div className="row">
                            <InputField label="Name" name="familyMemberName" value={formData.familyMemberName} onChange={handleChange} error={errors.familyMemberName} />
                            <div className="col">
                                <label>Relationship</label>
                                <select name="familyRelation" value={formData.familyRelation} onChange={handleChange} className={errors.familyRelation ? "input-error" : ""}>
                                    <option value="">Select</option>
                                    <option value="Father">Father</option>
                                    <option value="Mother">Mother</option>
                                    <option value="Husband">Husband</option>
                                    <option value="Wife">Wife</option>
                                    <option value="Guardian">Legal Guardian</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <InputField
                                label="EPIC Number"
                                name="familyEpic"
                                value={formData.familyEpic}
                                onChange={(e) => {
                                    let val = e.target.value.toUpperCase();
                                    if (val.length <= 3) {
                                        val = val.replace(/[^A-Z]/g, '');
                                    } else {
                                        const prefix = val.slice(0, 3).replace(/[^A-Z]/g, '');
                                        const suffix = val.slice(3).replace(/[^0-9]/g, '');
                                        val = prefix + suffix;
                                    }

                                    if (val.length <= 11) {
                                        handleChange({ target: { name: "familyEpic", value: val } });
                                    }
                                }}
                                error={errors.familyEpic}
                                placeholder="ABC12345678"
                                maxLength="11"
                                style={{ textTransform: "uppercase" }}
                            />
                        </div>
                    </Section>

                    <Section title="K. Declaration">
                        <p style={{ fontStyle: "italic", marginBottom: "15px" }}>I Hereby declare that to the best of My knowledge and belief.</p>

                        <div style={{ marginBottom: "15px" }}>
                            <p><strong>(i)</strong> I am a citizen of India and place of my birth is</p>
                            <div className="row">
                                <InputField label="Village/Town" name="declVillage" value={formData.declVillage} onChange={handleChange} error={errors.declVillage} required />
                                <div className="col">
                                    <label>State/UT <span className="required-asterisk">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.declState || ""}
                                        readOnly
                                        className="readonly-input"
                                    />
                                </div>
                                <div className="col">
                                    <label>District <span className="required-asterisk">*</span></label>
                                    <input
                                        type="text"
                                        value={formData.declDistrict || ""}
                                        readOnly
                                        className="readonly-input"
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <p><strong>(ii)</strong> I am ordinarily a resident at the address mentioned at Section 8(a) in Form 6 since <span className="required-asterisk">*</span></p>
                            <div className="row" style={{ maxWidth: "300px" }}>
                                <InputField label="" name="residentSince" type="month" value={formData.residentSince} onChange={handleChange} error={errors.residentSince} required />
                            </div>
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <p><strong>(iii)</strong> I am applying for inclusion in Electoral Roll for the first time and my name is not included in any Assembly Constituency/Parliamentary Constituency.</p>
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <p><strong>(iv)</strong> I don’t possess any of the mentioned documents for proof of Date of Birth/Age. Therefore, I have enclosed, below mentioned document in support of age proof. (Leave blank, if not applicable).</p>
                            <div className="row">
                                <InputField label="Support Document" name="ageProofSupport" value={formData.ageProofSupport} onChange={handleChange} />
                            </div>
                        </div>

                        <div style={{ marginBottom: "15px" }}>
                            <p><strong>(v)</strong> I am aware that making the above statement or declaration in relation to this application which is false and which I know or believe to be false or do not believe to be true, is punishable under Section 31 of Representation of the People Act,1950 (43 of 1950) with imprisonment for a term which may extend to one year or with fine or with both.</p>
                        </div>

                        <div className="row">
                            <InputField label="Place" name="declPlace" value={formData.declPlace} onChange={handleChange} error={errors.declPlace} required />
                            <InputField label="Date" name="declDate" type="date" value={formData.declDate} readOnly onChange={() => { }} />
                        </div>
                    </Section>

                    <div className="submit-btn-container">
                        <button type="submit" className="submit-btn" disabled={isSubmitting}>
                            {isSubmitting ? "Processing..." : "Submit Application"}
                        </button>
                    </div>

                </form>
            </div>

            {showPreview && <PreviewModal formData={formData} onClose={() => setShowPreview(false)} onConfirm={confirmSubmit} isSubmitting={isSubmitting} />}

            {
                submissionResult && (
                    <div className="modal-overlay">
                        <div className="success-modal-content">
                            <h2 style={{ color: "#333", marginBottom: "10px" }}>Application Submitted!</h2>
                            <p style={{ color: "#666", marginBottom: "20px" }}>Your application has been successfully</p>

                            <div className="success-ref-box">
                                <p style={{ margin: 0, fontSize: "14px", color: "#555" }}>Reference Number</p>
                                <h3 style={{ margin: "5px 0 0 0", color: "#007bff", fontSize: "24px" }}>{submissionResult.refNo}</h3>
                            </div>

                            <p style={{ fontSize: "13px", color: "#888", marginBottom: "30px" }}>Please save this Reference Number to track your application status.</p>

                            <div style={{ display: "flex", justifyContent: "center", gap: "15px" }}>
                                <Link to="/track-status" className="success-link-btn btn-primary">Track Status</Link>
                                <Link to="/" className="success-link-btn btn-secondary">Home</Link>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

const Section = ({ title, children }) => (
    <div className="section-container">
        <h3 className="section-head">{title}</h3>
        {children}
    </div>
);

const InputField = ({ label, name, value, onChange, error, success, type = "text", placeholder, required = false, ...props }) => (
    <div className={`col ${props.className || ""}`}>
        <label>{label} {required && <span className="required-asterisk">*</span>}</label>
        <input
            type={type} name={name}
            value={value || ""}
            onChange={onChange}
            placeholder={placeholder}
            className={error ? "input-error" : ""}
            {...props}
            style={{ ...props.style }}
        />
        {error && <small className="error-text">{error}</small>}
        {success && !error && <small style={{ color: "green", fontWeight: "bold", marginTop: "5px" }}>{success}</small>}
    </div>
);

const PreviewModal = ({ formData, onClose, onConfirm, isSubmitting }) => {
    if (!formData) return null;
    return (
        <div className="preview-modal-overlay">
            <div className="preview-modal-content">
                <h2 style={{ textAlign: "center", paddingBottom: "10px" }}>Application Preview</h2>
                <div style={{ width: "100%", textAlign: "left", marginBottom: "10px" }}>
                    <div >
                        <p>To,</p>
                        <p>The Electoral Registration Officer,</p>
                        <span>{formData.ac}, {formData.district}, {formData.state} </span>
                    </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                    <div style={{ marginBottom: "15px" }}>
                        {(formData.photo instanceof File || formData.photo instanceof Blob) ? (
                            <div style={{ textAlign: "center" }}>
                                <img
                                    src={URL.createObjectURL(formData.photo)}
                                    alt="Applicant"
                                    className="preview-photo"
                                />
                                <p style={{ fontSize: "12px", color: "#666" }}>Photograph</p>
                            </div>
                        ) : (
                            <div className="preview-photo-placeholder">No Photo</div>
                        )}
                    </div>
                </div>

                <div className="preview-grid">

                    <h4 className="preview-section-header">Personal Details</h4>
                    <p><strong>Name:</strong> {formData.firstName} {formData.surname}</p>
                    <p><strong>Gender:</strong> {formData.gender}</p>
                    <p><strong>DOB:</strong> {formData.dob}</p>
                    <p><strong>Mobile:</strong> {formData.mobile}</p>
                    <p><strong>Email:</strong> {formData.email}</p>
                    <p><strong>Aadhaar:</strong> {formData.aadhaar || "Not Furnished"}</p>

                    <h4 className="preview-section-header">Relative Details</h4>
                    <p><strong>Relation:</strong> {formData.relationType}</p>
                    <p><strong>Relative Name:</strong> {formData.relativeName} {formData.relativeSurname}</p>

                    <h4 className="preview-section-header">Present Address</h4>
                    <div className="preview-address-box">
                        {formData.houseNo}, {formData.street},<br />
                        {formData.village}, {formData.postOffice},<br />
                        {formData.tehsil}, {formData.districtP}, {formData.stateP} - {formData.pinCode}
                    </div>

                    <h4 className="preview-section-header">Family Member Details</h4>
                    <p><strong>Name:</strong> {formData.familyMemberName || "N/A"}</p>
                    <p><strong>Relation:</strong> {formData.familyRelation || "N/A"}</p>
                    <p><strong>EPIC No:</strong> {formData.familyEpic || "N/A"}</p>

                    <h4 className="preview-section-header">Disability Info (Optional)</h4>
                    <p><strong>Category:</strong> {formData.disabilityCat || "None"}</p>
                    <p><strong>Percentage:</strong> {formData.disabilityPerc ? `${formData.disabilityPerc}%` : "N/A"}</p>

                    <h4 className="preview-section-header">Uploaded Documents</h4>
                    <p><strong>DOB Proof:</strong> {formData.dobDocType} - {formData.dobProof ? "Uploaded" : "Not Uploaded"}</p>
                    {formData.dobProof && (formData.dobProof.type.startsWith("image/") ?
                        <img src={URL.createObjectURL(formData.dobProof)} style={{ maxWidth: "200px", marginTop: "5px", border: "1px solid #ddd" }} /> : null)}

                    <p><strong>Address Proof:</strong> {formData.addressDocType} - {formData.addressProof ? "Uploaded" : "Not Uploaded"}</p>
                    {formData.addressProof && (formData.addressProof.type.startsWith("image/") ?
                        <img src={URL.createObjectURL(formData.addressProof)} style={{ maxWidth: "200px", marginTop: "5px", border: "1px solid #ddd" }} /> : null)}

                    <p><strong>Disability Certificate:</strong> {formData.disabilityCert ? "Uploaded" : "Not Uploaded"}</p>
                    {formData.disabilityCert && (formData.disabilityCert.type.startsWith("image/") ?
                        <img src={URL.createObjectURL(formData.disabilityCert)} style={{ maxWidth: "200px", marginTop: "5px", border: "1px solid #ddd" }} /> : null)}

                    <h4 className="preview-section-header">Declaration</h4>
                    <p><strong>Born In:</strong> {formData.declVillage}, {formData.declState}, {formData.declDistrict}</p>
                    <p><strong>Resident Since:</strong> {formData.residentSince}</p>
                    <p><strong>Place of Application:</strong> {formData.declPlace}</p>
                    <p><strong>Date:</strong> {formData.declDate}</p>
                </div>

                <div className="preview-actions">
                    <button onClick={onClose} className="btn-outline" disabled={isSubmitting}>Edit</button>
                    <button onClick={onConfirm} className="btn-confirm" disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Confirm & Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
};
