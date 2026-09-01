export interface AcademicProgram {
  id: string;
  name: string;
  code: string;
  category: 'college' | 'shs' | 'basic';
  department: string;
  duration: string;
  description: string;
  badge: string;
  image: string;
  highlights: string[];
  careerOpportunities: string[];
  curriculumHighlights: string[];
  admissionRequirements: string[];
}

export interface NewsArticle {
  id: string;
  title: string;
  category: 'Announcement' | 'Academic' | 'Campus Life' | 'Achievement';
  date: string;
  author: string;
  readTime: string;
  summary: string;
  content: string;
  image: string;
  featured?: boolean;
}

export interface CampusFacility {
  id: string;
  title: string;
  category: 'Academic' | 'Technology' | 'Hospitality' | 'Student Life';
  description: string;
  image: string;
  features: string[];
}

export const COLLEGE_INFO = {
  name: 'IBA College of Mindanao, Inc.',
  shortName: 'IBACMI',
  tagline: '21st-Century Learning • Global Employability • Academic Excellence',
  motto: 'Innovative, Balanced, and Affordable Education',
  address: 'TN Pepito Street, Poblacion, Valencia City, 8709 Bukidnon, Philippines',
  contactNumber: '0917-863-5883',
  alternateNumber: '(088) 828-2194',
  email: 'irenebantonio3@gmail.com',
  officialEmail: 'info@ibacmi.edu.ph',
  registrarEmail: 'registrar@ibacmi.edu.ph',
  admissionsEmail: 'admissions@ibacmi.edu.ph',
  operatingHours: {
    weekdays: 'Monday to Friday: 8:00 AM – 5:00 PM',
    saturday: 'Saturday: 8:00 AM – 12:00 NN',
    sunday: 'Sunday: Closed (Campus Operations on Standby)',
  },
  established: 2005,
  accreditations: ['CHED Recognized', 'DepEd Permitted', 'TESDA Accredited', 'PEAC Certified'],
  portals: {
    collegePortal: 'https://college.ibacmi.edu.ph',
    facultyPortal: 'https://iteachcol.ibacmi.edu.ph',
  },
  facebook: 'https://www.facebook.com/IBACollegeOfMindanaoOfficial',
};

export const ACADEMIC_PROGRAMS: AcademicProgram[] = [
  {
    id: 'bsit',
    name: 'Bachelor of Science in Information Technology',
    code: 'BSIT',
    category: 'college',
    department: 'College of Information and Communications Technology',
    duration: '4 Years (8 Semesters)',
    description: 'A comprehensive computing program designed to train professionals in software engineering, mobile development, cloud computing, network architecture, and cybersecurity for global high-tech industries.',
    badge: 'CHED Recognized • High Demand',
    image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'Hands-on training in Full-Stack Web, Mobile, and Cloud Development',
      'Advanced Cisco & MikroTik Certified Networking Laboratories',
      'Capstone Projects linked directly with industry partners',
      'Industry immersion and internship with top tech firms in Mindanao and Metro Manila',
    ],
    careerOpportunities: [
      'Full-Stack Software Engineer',
      'Mobile App Developer (iOS / Android)',
      'Network & Systems Administrator',
      'Database Administrator & Cloud Engineer',
      'Cybersecurity & IT Infrastructure Specialist',
      'IT Project Manager & Business Analyst',
    ],
    curriculumHighlights: [
      'Algorithms & Object-Oriented Programming (Java, Python, TypeScript)',
      'Data Structures & Database Management Systems',
      'Web Systems & Modern Cloud Computing Architectures',
      'Information Assurance & Network Security',
      'Mobile Application Design & UX Engineering',
    ],
    admissionRequirements: [
      'Senior High School Report Card (Form 138/SF9) or SHS Diploma',
      'Certificate of Good Moral Character',
      'PSA-Authenticated Birth Certificate (Original & Photocopy)',
      'Two (2) pieces 2x2 ID Pictures with White Background',
      'Long Brown Envelope',
    ],
  },
  {
    id: 'bshm',
    name: 'Bachelor of Science in Hospitality Management',
    code: 'BSHM',
    category: 'college',
    department: 'College of Hospitality & Tourism Management',
    duration: '4 Years (8 Semesters)',
    description: 'Prepares students for executive roles in the world of hospitality, international hotel management, culinary arts, cruise ship operations, beverage management, and luxury resort hospitality.',
    badge: 'Industry Standard • TESDA Aligned',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'State-of-the-art commercial mock hotel suite, bartending station, and HRM kitchen',
      'National Competency Certifications (NC II & NC III) embedded in the curriculum',
      'International and local luxury hotel On-the-Job Training (OJT) partnerships',
      'Comprehensive training in food safety, HACCP, and gastronomy',
    ],
    careerOpportunities: [
      'Hotel & Resort General Manager / Front Office Director',
      'Executive Chef / Culinary Operations Specialist',
      'Food & Beverage (F&B) Director',
      'Cruise Line Hospitality Officer',
      'Event & Wedding Production Manager',
      'Tourism & Hospitality Consultant',
    ],
    curriculumHighlights: [
      'Front Office & Housekeeping Operations',
      'Commercial Culinary Arts & International Cuisine',
      'Bar & Beverage Management and Mixology',
      'Hospitality Marketing, Revenue Management & Event Planning',
      'Tourism Laws and Hospitality Human Resource Management',
    ],
    admissionRequirements: [
      'Senior High School Report Card (Form 138/SF9)',
      'Certificate of Good Moral Character',
      'PSA Birth Certificate',
      'Medical Health Clearance for Food Handlers',
      'Two (2) 2x2 ID Pictures & Long Brown Envelope',
    ],
  },
  {
    id: 'bsentrep',
    name: 'Bachelor of Science in Entrepreneurship',
    code: 'BSENTREP',
    category: 'college',
    department: 'College of Business and Enterprise Studies',
    duration: '4 Years (8 Semesters)',
    description: 'Empowers future business owners, startup founders, and corporate innovators to conceptualize, launch, scale, and finance viable commercial ventures in regional and global markets.',
    badge: 'Incubation Center • Venture Capital Pitch',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'Live Business Incubation and Actual Enterprise Operation requirement',
      'Mentorship from successful entrepreneurs, trade investors, and DTI consultants',
      'Modern digital commerce, social media marketing, and fintech integration',
      'Seed capital pitching competitions and product trade fairs',
    ],
    careerOpportunities: [
      'Business Founder & Startup CEO',
      'Corporate Innovation & Business Development Manager',
      'Franchise Owner & Retail Operations Director',
      'E-commerce & Digital Venture Strategist',
      'Investment & SME Financial Consultant',
    ],
    curriculumHighlights: [
      'Opportunity Seeking & Venture Ideation',
      'Market Feasibility & Financial Forecasting',
      'Product Development & Digital Branding',
      'Supply Chain Logistics & E-Commerce Infrastructure',
      'Business Enterprise Incubation & Execution Practicum',
    ],
    admissionRequirements: [
      'Senior High School Report Card (Form 138/SF9)',
      'Good Moral Character Certificate',
      'PSA Birth Certificate (Original & Copy)',
      'Two 2x2 ID Pictures & Long Envelope',
    ],
  },
  {
    id: 'bscrim',
    name: 'Bachelor of Science in Criminology',
    code: 'BSCrim',
    category: 'college',
    department: 'College of Criminal Justice Education',
    duration: '4 Years (8 Semesters)',
    description: 'A rigorous academic and physical training program focusing on crime prevention, forensic science, criminal law, ballistic examination, law enforcement administration, and correctional systems.',
    badge: 'Disciplined Excellence • Board Exam Track',
    image: 'https://images.unsplash.com/photo-1453873531674-2151abc01707?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'Equipped Forensics, Dactyloscopy (Fingerprinting), and Ballistics Simulation Lab',
      'Rigorous physical fitness, martial arts, marksmanship, and leadership drills',
      'Intensive Board Licensure Examination (CLE) in-house review modules',
      'Community policing internships with PNP, BJMP, BFP, and PDEA',
    ],
    careerOpportunities: [
      'Philippine National Police (PNP) Officer',
      'Bureau of Fire Protection (BFP) Officer',
      'Bureau of Jail Management and Penology (BJMP) Officer',
      'Forensic Science & Fingerprint Examiner',
      'Private Security Executive & Corporate Investigator',
      'National Bureau of Investigation (NBI) Agent',
    ],
    curriculumHighlights: [
      'Criminal Law & Jurisprudence (Book 1 & 2)',
      'Forensic Ballistics, Photography & Questioned Documents',
      'Crime Scene Investigation & Incident Management',
      'Correctional Administration & Criminal Sociology',
      'Law Enforcement Operations and Ethics',
    ],
    admissionRequirements: [
      'Form 138 / SF9 Report Card',
      'Certificate of Good Moral Character',
      'PSA Birth Certificate',
      'Physical & Medical Clearance (Drug Test & Neurological Clearance)',
      'Two 2x2 Photos with Name Tag',
    ],
  },
  {
    id: 'beed',
    name: 'Bachelor of Elementary Education',
    code: 'BEEd',
    category: 'college',
    department: 'College of Teacher Education',
    duration: '4 Years (8 Semesters)',
    description: 'Prepares compassionate and highly skilled educators equipped to teach across all elementary subjects with modern 21st-century instructional technologies and learner-centered strategies.',
    badge: 'DepEd Aligned • LET Board Ready',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'Comprehensive preparation for the Licensure Examination for Teachers (LET)',
      'Early classroom observation and student teaching in partner model schools',
      'Instructional material development using digital interactive tools',
      'Special focus on literacy, numeracy, and inclusive classroom education',
    ],
    careerOpportunities: [
      'Licensed Elementary School Teacher (Public / Private)',
      'Curriculum Specialist & Educational Content Developer',
      'Instructional Material Designer & Textbook Author',
      'Educational Consultant & Tutorial Center Administrator',
    ],
    curriculumHighlights: [
      'Teaching Literacy and Numeracy in the Primary Grades',
      'Child and Adolescent Learners and Learning Principles',
      'Technology for Teaching and Learning (EdTech 1 & 2)',
      'Classroom Assessment & Educational Measurement',
      'Field Study and Intensive On-Site Practice Teaching',
    ],
    admissionRequirements: [
      'Form 138 / SF9 SHS Card with passing GPA',
      'Good Moral Character Certificate',
      'PSA Birth Certificate',
      'Two 2x2 ID Photos',
    ],
  },
  {
    id: 'beced',
    name: 'Bachelor of Early Childhood Education',
    code: 'BECEd',
    category: 'college',
    department: 'College of Teacher Education',
    duration: '4 Years (8 Semesters)',
    description: 'Specialized educator training focusing on the critical early stages of child growth, sensory exploration, play-based learning pedagogies, and preschool leadership.',
    badge: 'Child Psychology • Early Learning',
    image: 'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'Montessori and play-based pedagogical workshops',
      'Child observation laboratory and early childhood behavior analytics',
      'Parent-teacher collaboration and developmental milestone tracking',
      'Preparation for international preschool and kindergarten teaching',
    ],
    careerOpportunities: [
      'Preschool & Kindergarten Licensed Educator',
      'Early Childhood Learning Center Director',
      'Child Development Specialist & Educational Coach',
      'Children’s Educational Program Producer',
    ],
    curriculumHighlights: [
      'Infant and Toddler Development & Early Stimulation',
      'Play-Based and Active Learning Methodologies',
      'Health, Nutrition, and Safety in Early Childhood Settings',
      'Special Needs and Inclusive Early Learning Environments',
    ],
    admissionRequirements: [
      'Form 138 / SF9 Report Card',
      'Certificate of Good Moral Character',
      'PSA Birth Certificate',
      'Two 2x2 ID Photos & Envelope',
    ],
  },
  {
    id: 'bpa',
    name: 'Bachelor of Public Administration',
    code: 'BPA',
    category: 'college',
    department: 'College of Public Governance and Administration',
    duration: '4 Years (8 Semesters)',
    description: 'Develops ethical, competent, and forward-thinking public servants, local government administrators, policy analysts, and NGO leaders for the public sector.',
    badge: 'Civil Service Track • Governance',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'In-depth immersion in Local Government Units (LGUs) and National Agencies',
      'Civil Service Professional Examination preparation track',
      'Public fiscal policy, budgeting, and e-governance implementation training',
      'Ethics, accountability, and anti-corruption leadership principles',
    ],
    careerOpportunities: [
      'Local Government Unit (LGU) Administrator / Officer',
      'Policy Analyst & Public Affairs Officer',
      'Human Resource & Civil Service Manager',
      'Non-Governmental Organization (NGO) Director',
      'Legislative Staff & Government Program Coordinator',
    ],
    curriculumHighlights: [
      'Philippine Administrative System & Constitution',
      'Public Fiscal Administration & Government Accounting',
      'Policy Formulation, Implementation & Evaluation',
      'Ethics and Accountability in the Public Service',
      'Local Government Administration & E-Governance',
    ],
    admissionRequirements: [
      'Form 138 / SF9 Report Card',
      'Certificate of Good Moral Character',
      'PSA Birth Certificate',
      'Two 2x2 ID Photos & Long Envelope',
    ],
  },
  {
    id: 'shs-stem',
    name: 'Senior High School - STEM Strand',
    code: 'SHS-STEM',
    category: 'shs',
    department: 'Basic Education Department - Senior High',
    duration: '2 Years (Grade 11 & 12)',
    description: 'Science, Technology, Engineering, and Mathematics strand preparing students for rigorous university programs in computing, engineering, medical sciences, and architecture.',
    badge: 'DepEd Voucher Accepted • Tech Lab Access',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'Modern Science & Physics Laboratories',
      'Advanced Mathematics, Calculus, and Robotics Electives',
      'DepEd Senior High School Voucher Grant Beneficiary',
      'Automatic admission bridge to IBACMI College Programs with tuition discounts',
    ],
    careerOpportunities: [
      'IT & Software Engineering',
      'Civil, Mechanical, & Electrical Engineering',
      'Nursing, Medicine, & Allied Health Sciences',
      'Architecture & Applied Physics',
    ],
    curriculumHighlights: [
      'Pre-Calculus & Basic Calculus',
      'General Chemistry, Biology & Physics',
      'Empowerment Technologies & Research Capstone',
    ],
    admissionRequirements: [
      'Grade 10 Form 138 (Report Card) / Certificate of Completion',
      'PSA Birth Certificate',
      'Certificate of Good Moral Character',
      'ESC Certificate or QVR Voucher (if applicable)',
    ],
  },
  {
    id: 'shs-abm',
    name: 'Senior High School - ABM Strand',
    code: 'SHS-ABM',
    category: 'shs',
    department: 'Basic Education Department - Senior High',
    duration: '2 Years (Grade 11 & 12)',
    description: 'Accountancy, Business, and Management strand preparing young leaders for entrepreneurial ventures, corporate management, financial analytics, and business degrees.',
    badge: 'DepEd Voucher Accepted • Business Sim',
    image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'Practical business simulation and annual entrepreneurship trade fair',
      'Fundamentals of accounting and financial management software',
      'DepEd Voucher subsidy covers 100% of approved tuition for voucher holders',
    ],
    careerOpportunities: [
      'Accountancy & Financial Auditing',
      'Business Administration & Marketing',
      'Banking, Microfinance & Entrepreneurship',
    ],
    curriculumHighlights: [
      'Fundamentals of Accountancy, Business & Management 1 & 2',
      'Business Finance & Principles of Marketing',
      'Business Ethics & Social Responsibility',
    ],
    admissionRequirements: [
      'Grade 10 Report Card (Form 138)',
      'Good Moral Certificate & PSA Birth Certificate',
      'ESC / QVR Voucher Slip',
    ],
  },
  {
    id: 'shs-tvl',
    name: 'Senior High School - TVL Strand (ICT & Home Economics)',
    code: 'SHS-TVL',
    category: 'shs',
    department: 'Basic Education Department - Senior High',
    duration: '2 Years (Grade 11 & 12)',
    description: 'Technical-Vocational-Livelihood track providing dual pathways: TESDA National Certifications (NC II) for immediate high-paying employment AND university readiness.',
    badge: 'TESDA NC II Certified • Zero Tuition via Voucher',
    image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'Specializations in Computer Systems Servicing (CSS NC II) and Bread & Pastry / Food & Beverage (NC II)',
      'Free TESDA National Assessment upon completion of specialization',
      'Extensive hands-on lab time in fully equipped institutional facilities',
    ],
    careerOpportunities: [
      'Certified Computer Hardware & Network Technician',
      'Commercial Baker & Pastry Chef',
      'Food & Beverage Captain / Barista',
      'Junior Web Developer & Tech Support',
    ],
    curriculumHighlights: [
      'Computer Systems Servicing / Bread & Pastry Production',
      'Food & Beverage Services / Bartending',
      'Work Immersion Practicum in Local Industry Partners',
    ],
    admissionRequirements: [
      'Grade 10 Report Card',
      'Good Moral Certificate & PSA Birth Certificate',
      'Voucher Certificate (if applicable)',
    ],
  },
  {
    id: 'basic-ed',
    name: 'Basic Education (Pre-School, Elementary & Junior High School)',
    code: 'K-10',
    category: 'basic',
    department: 'Basic Education Department',
    duration: 'Kindergarten to Grade 10',
    description: 'Nurturing holistic development, character formation, academic rigor, and 21st-century technological literacy from early childhood through Junior High School.',
    badge: 'DepEd Certified • Values-Centered',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'Values-centered and safe learning environment in Valencia City',
      'Integrated computer classes and science laboratory exposures',
      'Active sports, arts, scouting, and campus organizations',
      'Small class sizes for personalized teacher-student mentorship',
    ],
    careerOpportunities: [
      'Solid foundation for Senior High School strands and higher academic pursuits',
    ],
    curriculumHighlights: [
      'DepEd K to 12 Enhanced Basic Education Curriculum',
      'Computer Literacy and Coding for Young Learners',
      'Character Education and Civic Leadership',
    ],
    admissionRequirements: [
      'Previous Grade Level Report Card (Form 138)',
      'PSA Birth Certificate (Original & Photocopy)',
      'Certificate of Good Moral Character (for JHS)',
      'Two (2) 2x2 ID Pictures',
    ],
  },
];

export const CAMPUS_FACILITIES: CampusFacility[] = [
  {
    id: 'it-labs',
    title: 'Advanced Computer & Networking Laboratories',
    category: 'Technology',
    description: 'High-speed gigabit interconnected computer terminals equipped with modern software development IDEs, database management suites, and dedicated Cisco network switching rigs.',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    features: ['High-Speed Fiber Connectivity', 'Dedicated Server Racks & Cisco Switches', 'Dual-Boot Linux & Windows Workstations', 'Fully Air-Conditioned Ergonomic Setup'],
  },
  {
    id: 'hrm-suite',
    title: 'Commercial HRM Kitchen & Mock Hotel Suite',
    category: 'Hospitality',
    description: 'Industry-standard culinary preparation workstations, bar and beverage counter, and a five-star mock hotel guest room for real-world housekeeping and front-office simulation.',
    image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=800&q=80',
    features: ['Stainless Steel Commercial Ranges & Ovens', 'Full Mixology Bar Setup', 'Master Suite Hotel Training Room', 'Food Safety & Hygiene Compliant'],
  },
  {
    id: 'criminology-lab',
    title: 'Criminology & Forensics Simulation Laboratory',
    category: 'Academic',
    description: 'Equipped with dactyloscopy fingerprint comparative microscopes, ballistic reference charts, and mock crime scene layout grids for forensic investigative exercises.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    features: ['Latent Fingerprint Development Stations', 'Forensic Optical Equipment', 'Mock Crime Scene Stage', 'Physical Agility Training Grounds'],
  },
  {
    id: 'library-hub',
    title: 'Modern Library & Digital Resource Center',
    category: 'Student Life',
    description: 'Quiet study carrels, expansive reference book stacks, academic journal archives, and high-speed online OPAC terminals for digital research.',
    image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80',
    features: ['E-Library Research Terminals', 'Extensive Physical Book Collection', 'Collaborative Group Study Rooms', 'Automated Catalog & Borrowing System'],
  },
  {
    id: 'auditorium',
    title: 'Multi-Purpose Student Activity Pavilion',
    category: 'Student Life',
    description: 'Spacious venue for institutional convocations, student council general assemblies, cultural pageants, sports meets, and community gatherings.',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
    features: ['Full Stage with Professional Audio-Visual Setup', 'Basketball & Volleyball Regulation Court', 'Graduation & Event Seating Capacity for 1,000+', 'Safe Covered Campus Area'],
  },
];

export const NEWS_ARTICLES: NewsArticle[] = [
  {
    id: 'batch-fortis-2026',
    title: 'Commencement Exercises: Honoring the Mighty "Batch Fortis" Graduates',
    category: 'Achievement',
    date: 'May 18, 2026',
    author: 'Office of the Vice President for Academic Affairs',
    readTime: '4 min read',
    summary: 'IBA College of Mindanao, Inc. proudly conferred diplomas and degrees upon the resilient graduates of Batch Fortis across all College programs and Senior High School strands.',
    content: 'Valencia City, Bukidnon — In an inspiring and emotional commencement ceremony, IBA College of Mindanao celebrated the graduation of Batch Fortis. The ceremony brought together proud parents, distinguished faculty members, and community leaders to honor the hard work, perseverance, and intellectual accomplishments of our graduating class. President Irene B. Antonio delivered the keynote address, encouraging the graduates to carry the IBACMI torch of integrity, brilliance, and global competence into their respective careers.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    featured: true,
  },
  {
    id: 'enrollment-ay-2026-2027',
    title: 'Early Enrollment for Academic Year 2026–2027 Is Now Officially Open',
    category: 'Announcement',
    date: 'June 01, 2026',
    author: 'Office of the College Registrar',
    readTime: '3 min read',
    summary: 'Online registration, student profiling, and on-campus document submission are now open for incoming College Freshmen, Transferees, and Senior High School Voucher Grantees.',
    content: 'Prospective students and transferees are invited to register early to secure their slots for the upcoming Academic Year. IBACMI offers flexible payment arrangements, full DepEd Senior High School Voucher acceptance (with zero top-up tuition for eligible public school completers), and competitive academic scholarship grants for honor students.',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80',
    featured: true,
  },
  {
    id: 'it-tech-expo-2026',
    title: 'IBACMI ICT Department Hosts 21st-Century Tech Summit and Capstone Expo',
    category: 'Academic',
    date: 'April 22, 2026',
    author: 'CICT Department Head',
    readTime: '3 min read',
    summary: 'BSIT students showcased innovative capstone projects including AI-assisted campus tracking systems, mobile health apps, and smart agricultural monitoring solutions.',
    content: 'The College of Information and Communications Technology hosted its annual Capstone Exposition, where senior BSIT students demonstrated software and IoT solutions evaluated by industry panels from CDO and Davao tech hubs. Several projects received commendations for practical community impact in Bukidnon.',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 'hm-culinary-championship',
    title: 'Hospitality Management Students Excel at Regional Culinary Showcase',
    category: 'Achievement',
    date: 'March 15, 2026',
    author: 'HM Faculty Coordinator',
    readTime: '2 min read',
    summary: 'IBACMI BSHM culinary representatives bagged Gold and Silver medals in regional flair bartending and modern Mindanaoan fusion culinary competitions.',
    content: 'Demonstrating world-class culinary expertise, our BSHM students took top honors at the Northern Mindanao Hospitality Competitions. The team showcased precision knife skills, innovative dessert plating utilizing Bukidnon pineapple and coffee, and professional mixology routines.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
  },
];

export const ENROLLMENT_STEPS = [
  {
    step: '01',
    title: 'Online Profiling & Pre-Registration',
    description: 'Fill out the online student admission form or visit the IBACMI Admissions Office on TN Pepito St., Valencia City to generate your Applicant ID.',
    badge: 'Step 1',
  },
  {
    step: '02',
    title: 'Document Submission & Verification',
    description: 'Submit your Form 138/SF9, Good Moral Certificate, PSA Birth Certificate, and 2x2 ID photos to the Office of the Registrar for validation.',
    badge: 'Step 2',
  },
  {
    step: '03',
    title: 'Academic Advising & Subject Encoding',
    description: 'Meet with your designated Department Program Head for curriculum orientation, credit evaluation, and official subject schedule encoding.',
    badge: 'Step 3',
  },
  {
    step: '04',
    title: 'Assessment, Payment & Official ID Issuance',
    description: 'Proceed to the Cashier / Accounting Office for fee assessment (or voucher validation), claim your official Certificate of Registration (COR), and receive your IBACMI Student ID.',
    badge: 'Step 4',
  },
];

export const ADMISSION_REQUIREMENTS = {
  freshmen: [
    'Original Form 138 / SF9 (Senior High School Report Card) or SHS Diploma',
    'Original Certificate of Good Moral Character from previous school principal/guidance',
    'PSA Authenticated Birth Certificate (1 Original + 2 Clear Photocopies)',
    'Two (2) pieces recent 2x2 ID Pictures with White Background & Name Tag',
    'One (1) Long Brown Envelope',
    'PSA Marriage Certificate (if married for female applicants)',
  ],
  transferees: [
    'Official Transcript of Records (TOR) or Informative Copy for evaluation',
    'Certificate of Honorable Dismissal / Transfer Credential',
    'Certificate of Good Moral Character from previous Dean / Registrar',
    'Course / Subject Description syllabus (for credited subjects evaluation)',
    'PSA Authenticated Birth Certificate (1 Original + 2 Photocopies)',
    'Two (2) pieces 2x2 ID Pictures & Long Brown Envelope',
  ],
  shs: [
    'Original Grade 10 Report Card (Form 138 / SF9)',
    'Certificate of Junior High School Completion',
    'Certificate of Good Moral Character',
    'PSA Birth Certificate (Original + Photocopies)',
    'DepEd ESC Certificate or QVR Voucher Confirmation Slip',
    'Two (2) 2x2 ID Pictures & Long Brown Envelope',
  ],
};

export const QUICK_STATS = [
  { label: 'Academic Programs', value: '11+', subtext: 'College Degrees & SHS Strands' },
  { label: 'Employability Rate', value: '94%', subtext: 'Graduates placed within 6 months' },
  { label: 'Years of Excellence', value: '20+', subtext: 'Serving Valencia & Mindanao' },
  { label: 'Voucher Coverage', value: '100%', subtext: 'Accepted DepEd SHS Vouchers' },
];

export const CORE_VALUES = [
  {
    letter: 'I',
    word: 'Integrity',
    description: 'Upholding unwavering honesty, transparency, and ethical conduct in all academic, professional, and personal endeavors.',
  },
  {
    letter: 'B',
    word: 'Brilliance',
    description: 'Pursuing mastery in knowledge, technological innovation, and skill proficiency through continuous learning and dedication.',
  },
  {
    letter: 'A',
    word: 'Adaptability',
    description: 'Embracing 21st-century change with agility, critical thinking, and resilient problem-solving in dynamic global landscapes.',
  },
  {
    letter: 'C',
    word: 'Commitment',
    description: 'Dedicated to community upliftment, sustainable student welfare, and delivering accessible high-caliber education.',
  },
  {
    letter: 'M',
    word: 'Mindanaoan Spirit',
    description: 'Fostering cultural pride, peace advocacy, and economic progress across Valencia, Bukidnon, and the entire island of Mindanao.',
  },
];
