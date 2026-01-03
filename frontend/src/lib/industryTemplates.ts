export interface IndustryTemplate {
    id: string;
    name: string;
    industry: string;
    description: string;
    keywords: string[];
    format: 'chronological' | 'functional' | 'combination';
    sections: string[];
}

export const industryTemplates: IndustryTemplate[] = [
    {
        id: 'tech-software',
        name: 'Tech/Software Engineering',
        industry: 'Technology',
        description: 'Optimized for software engineering roles with emphasis on technical skills and projects',
        keywords: ['software', 'developer', 'engineer', 'programming', 'coding'],
        format: 'chronological',
        sections: ['Summary', 'Technical Skills', 'Experience', 'Projects', 'Education', 'Certifications'],
    },
    {
        id: 'product-management',
        name: 'Product Management',
        industry: 'Technology',
        description: 'Focus on product strategy, metrics, and cross-functional collaboration',
        keywords: ['product', 'manager', 'strategy', 'roadmap', 'agile'],
        format: 'combination',
        sections: ['Summary', 'Core Competencies', 'Experience', 'Education', 'Certifications'],
    },
    {
        id: 'marketing',
        name: 'Marketing & Digital',
        industry: 'Marketing',
        description: 'Highlight campaigns, metrics, and brand management experience',
        keywords: ['marketing', 'digital', 'brand', 'campaign', 'social media'],
        format: 'chronological',
        sections: ['Summary', 'Skills', 'Experience', 'Campaigns', 'Education'],
    },
    {
        id: 'finance',
        name: 'Finance & Accounting',
        industry: 'Finance',
        description: 'Emphasize financial analysis, compliance, and quantitative achievements',
        keywords: ['finance', 'accounting', 'analyst', 'cpa', 'financial'],
        format: 'chronological',
        sections: ['Summary', 'Core Competencies', 'Experience', 'Education', 'Certifications', 'Licenses'],
    },
    {
        id: 'healthcare',
        name: 'Healthcare',
        industry: 'Healthcare',
        description: 'Focus on patient care, medical expertise, and certifications',
        keywords: ['healthcare', 'medical', 'nurse', 'physician', 'clinical'],
        format: 'chronological',
        sections: ['Summary', 'Licenses & Certifications', 'Experience', 'Education', 'Professional Memberships'],
    },
    {
        id: 'sales',
        name: 'Sales & Business Development',
        industry: 'Sales',
        description: 'Highlight revenue generation, client relationships, and quotas',
        keywords: ['sales', 'business development', 'revenue', 'quota', 'client'],
        format: 'combination',
        sections: ['Summary', 'Key Achievements', 'Experience', 'Education'],
    },
    {
        id: 'consulting',
        name: 'Consulting',
        industry: 'Consulting',
        description: 'Emphasize problem-solving, client impact, and strategic thinking',
        keywords: ['consulting', 'strategy', 'client', 'advisory', 'transformation'],
        format: 'combination',
        sections: ['Summary', 'Core Competencies', 'Experience', 'Education', 'Certifications'],
    },
    {
        id: 'design',
        name: 'Design & Creative',
        industry: 'Creative',
        description: 'Showcase portfolio, creative projects, and design thinking',
        keywords: ['design', 'creative', 'ux', 'ui', 'graphic'],
        format: 'chronological',
        sections: ['Summary', 'Skills', 'Experience', 'Portfolio Projects', 'Education'],
    },
    {
        id: 'data-science',
        name: 'Data Science & Analytics',
        industry: 'Technology',
        description: 'Highlight data analysis, machine learning, and statistical expertise',
        keywords: ['data', 'analytics', 'machine learning', 'python', 'sql'],
        format: 'chronological',
        sections: ['Summary', 'Technical Skills', 'Experience', 'Projects', 'Education', 'Publications'],
    },
    {
        id: 'general',
        name: 'General Professional',
        industry: 'General',
        description: 'Versatile template suitable for various industries',
        keywords: [],
        format: 'chronological',
        sections: ['Summary', 'Skills', 'Experience', 'Education', 'Certifications'],
    },
];

export function getTemplateByIndustry(industry: string): IndustryTemplate | undefined {
    return industryTemplates.find(t => 
        t.industry.toLowerCase() === industry.toLowerCase() ||
        t.keywords.some(kw => industry.toLowerCase().includes(kw.toLowerCase()))
    );
}

export function getTemplateById(id: string): IndustryTemplate | undefined {
    return industryTemplates.find(t => t.id === id);
}

