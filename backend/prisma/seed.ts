import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Nightingale Database Seeding...');

  // Clean existing tables
  await prisma.consultation.deleteMany();
  await prisma.riskScore.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.diagnosticReport.deleteMany();
  await prisma.medicalHistory.deleteMany();
  await prisma.vitalRecord.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  const doctorPassword = await bcrypt.hash('Doctor123!', 10);
  const adminPassword = await bcrypt.hash('Admin123!', 10);

  // 1. Create Staff Users
  const doctor = await prisma.user.create({
    data: {
      name: 'Dr. Sarah Jenkins, MD',
      email: 'doctor@nightingale.med',
      passwordHash: doctorPassword,
      role: 'DOCTOR',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Chief Admin Marcus Vance',
      email: 'admin@nightingale.med',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Created Doctor & Admin staff accounts');

  // 2. Create Patients with Rich Clinical Histories
  const patientsData = [
    {
      name: 'Eleanor Vance',
      age: 72,
      gender: 'Female',
      bloodType: 'A+',
      roomNumber: 'ICU-104',
      ward: 'ICU',
      phone: '+1 (555) 234-5678',
      history: [
        { condition: 'Congestive Heart Failure (NYHA Class III)', diagnosedDate: new Date('2021-04-12'), medications: ['Furosemide 40mg', 'Lisinopril 10mg', 'Metoprolol 25mg'] },
        { condition: 'Type 2 Diabetes Mellitus', diagnosedDate: new Date('2018-09-20'), medications: ['Metformin 500mg', 'Insulin Glargine'] },
      ],
      vitals: { heartRate: 114, bpSystolic: 152, bpDiastolic: 94, spo2: 89.5, temperature: 38.2, glucose: 185 },
      reports: [
        { title: '12-Lead ECG - Sinus Tachycardia with ST Depression', fileUrl: '/reports/ecg_eleanor.pdf', fileType: 'PDF', summary: '12-Lead ECG demonstrates persistent sinus tachycardia at 115 bpm with mild lateral ST segment depression (V5-V6). Recommend bedside cardiac echo.' },
        { title: 'Chest Radiograph (PA/Lateral)', fileUrl: '/reports/cxr_eleanor.pdf', fileType: 'PDF', summary: 'Bilateral lower lobe interstitial edema consistent with acute pulmonary congestion. Heart size enlarged.' }
      ],
      initialRisk: { score: 88, level: 'CRITICAL', topFactors: [{ feature: 'Severe Hypoxia (SpO2 89.5%)', contribution: 0.45 }, { feature: 'Tachycardia (HR 114 bpm)', contribution: 0.30 }, { feature: 'Age > 70 with CHF History', contribution: 0.15 }] },
      alert: { type: 'THRESHOLD', severity: 'CRITICAL', message: 'Critical Hypoxia Alert: SpO2 dropped below 90% (Current: 89.5%)' }
    },
    {
      name: 'Robert Miller',
      age: 64,
      gender: 'Male',
      bloodType: 'O+',
      roomNumber: 'CARD-208',
      ward: 'CARDIOLOGY',
      phone: '+1 (555) 876-5432',
      history: [
        { condition: 'Acute Coronary Syndrome (Post-PCI)', diagnosedDate: new Date('2024-01-15'), medications: ['Ticagrelor 90mg', 'Aspirin 81mg', 'Atorvastatin 80mg'] },
        { condition: 'Hypertension', diagnosedDate: new Date('2015-06-10'), medications: ['Amlodipine 5mg'] }
      ],
      vitals: { heartRate: 84, bpSystolic: 138, bpDiastolic: 88, spo2: 96, temperature: 36.9, glucose: 112 },
      reports: [
        { title: 'Coronary Angiography Summary', fileUrl: '/reports/angio_robert.pdf', fileType: 'PDF', summary: 'Successful drug-eluting stent placement in proximal LAD with 0% residual stenosis. TIMI 3 flow restored.' }
      ],
      initialRisk: { score: 48, level: 'MODERATE', topFactors: [{ feature: 'Post-PCI Status', contribution: 0.30 }, { feature: 'Borderline Systolic BP', contribution: 0.18 }] },
      alert: { type: 'THRESHOLD', severity: 'MEDIUM', message: 'Borderline Hypertension: BP 138/88 mmHg' }
    },
    {
      name: 'Sophia Patel',
      age: 29,
      gender: 'Female',
      bloodType: 'B+',
      roomNumber: 'RESP-302',
      ward: 'PULMONOLOGY',
      phone: '+1 (555) 432-1098',
      history: [
        { condition: 'Severe Persistent Asthma', diagnosedDate: new Date('2012-03-05'), medications: ['Fluticasone/Salmeterol 250/50', 'Albuterol HFA PRN'] }
      ],
      vitals: { heartRate: 98, bpSystolic: 118, bpDiastolic: 76, spo2: 94.2, temperature: 37.1, glucose: 95 },
      reports: [
        { title: 'Spirometry Pulmonary Function Test', fileUrl: '/reports/pft_sophia.pdf', fileType: 'PDF', summary: 'FEV1/FVC ratio 68%, indicating moderate airflow obstruction responsive to bronchodilators.' }
      ],
      initialRisk: { score: 58, level: 'HIGH', topFactors: [{ feature: 'Asthma Exacerbation Risk (SpO2 94.2%)', contribution: 0.35 }, { feature: 'Elevated Resting HR (98 bpm)', contribution: 0.23 }] },
      alert: { type: 'THRESHOLD', severity: 'HIGH', message: 'Oxygen Saturation Warning: SpO2 94.2% on room air' }
    },
    {
      name: 'James Harrison',
      age: 55,
      gender: 'Male',
      bloodType: 'AB-',
      roomNumber: 'GEN-410',
      ward: 'GENERAL WARD',
      phone: '+1 (555) 901-2345',
      history: [
        { condition: 'Post-Op Laparoscopic Cholecystectomy', diagnosedDate: new Date('2026-07-28'), medications: ['Acetaminophen 1000mg IV', 'Ondansetron 4mg'] }
      ],
      vitals: { heartRate: 72, bpSystolic: 122, bpDiastolic: 78, spo2: 98.8, temperature: 36.6, glucose: 104 },
      reports: [
        { title: 'Post-Operative Abdominal Ultrasound', fileUrl: '/reports/us_james.pdf', fileType: 'PDF', summary: 'Gallbladder fossa clean with minimal fluid collection. Normal surgical recovery.' }
      ],
      initialRisk: { score: 12, level: 'LOW', topFactors: [{ feature: 'Stable Post-Op Recovery', contribution: 0.05 }] },
      alert: null
    },
    {
      name: 'Clara Oswald',
      age: 41,
      gender: 'Female',
      bloodType: 'O-',
      roomNumber: 'NEURO-112',
      ward: 'NEUROLOGY',
      phone: '+1 (555) 654-3210',
      history: [
        { condition: 'Migraine with Aura', diagnosedDate: new Date('2019-11-11'), medications: ['Sumatriptan 50mg PRN'] }
      ],
      vitals: { heartRate: 68, bpSystolic: 114, bpDiastolic: 72, spo2: 99.1, temperature: 36.7, glucose: 90 },
      reports: [
        { title: 'Brain MRI with Contrast', fileUrl: '/reports/mri_clara.pdf', fileType: 'PDF', summary: 'Unremarkable brain MRI. No acute intracranial hemorrhage, mass effect, or ischemic stroke.' }
      ],
      initialRisk: { score: 8, level: 'LOW', topFactors: [{ feature: 'Normal Neuro Vitals', contribution: 0.02 }] },
      alert: null
    }
  ];

  for (const pData of patientsData) {
    const patient = await prisma.patient.create({
      data: {
        name: pData.name,
        age: pData.age,
        gender: pData.gender,
        bloodType: pData.bloodType,
        roomNumber: pData.roomNumber,
        ward: pData.ward,
        phone: pData.phone,
        assignedDoctorId: doctor.id,
      },
    });

    // Medical History
    for (const h of pData.history) {
      await prisma.medicalHistory.create({
        data: {
          patientId: patient.id,
          condition: h.condition,
          diagnosedDate: h.diagnosedDate,
          medications: JSON.stringify(h.medications),
        },
      });
    }

    // Initial Vitals
    await prisma.vitalRecord.create({
      data: {
        patientId: patient.id,
        heartRate: pData.vitals.heartRate,
        bpSystolic: pData.vitals.bpSystolic,
        bpDiastolic: pData.vitals.bpDiastolic,
        spo2: pData.vitals.spo2,
        temperature: pData.vitals.temperature,
        glucose: pData.vitals.glucose,
        source: 'SIMULATED',
      },
    });

    // Reports
    for (const r of pData.reports) {
      await prisma.diagnosticReport.create({
        data: {
          patientId: patient.id,
          title: r.title,
          fileUrl: r.fileUrl,
          fileType: r.fileType,
          summary: r.summary,
        },
      });
    }

    // Risk Score
    await prisma.riskScore.create({
      data: {
        patientId: patient.id,
        score: pData.initialRisk.score,
        level: pData.initialRisk.level,
        topFactors: JSON.stringify(pData.initialRisk.topFactors),
      },
    });

    // Alert if exists
    if (pData.alert) {
      await prisma.alert.create({
        data: {
          patientId: patient.id,
          type: pData.alert.type,
          severity: pData.alert.severity,
          message: pData.alert.message,
        },
      });
    }

    // Schedule sample consultation for Eleanor & Robert
    if (pData.name === 'Eleanor Vance') {
      await prisma.consultation.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          scheduledAt: new Date(Date.now() + 3600000 * 2), // 2 hours from now
          status: 'SCHEDULED',
          notes: 'Urgent cardiac tele-rounding to review hypoxemia and ST depression on ECG.',
          prescription: 'Titrable Oxygen therapy 2L/min via nasal cannula. Adjust IV Furosemide.',
        },
      });
    } else if (pData.name === 'Robert Miller') {
      await prisma.consultation.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          scheduledAt: new Date(Date.now() + 3600000 * 24), // tomorrow
          status: 'SCHEDULED',
          notes: 'Follow-up cardiology consultation post stent placement.',
        },
      });
    }
  }

  console.log('✅ Successfully seeded Nightingale database with 5 clinical patient records');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
