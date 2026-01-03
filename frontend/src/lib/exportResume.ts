import { ResumeData } from "@/services/api";

export async function exportToPDF(resumeData: ResumeData) {
    // Using html2pdf library for PDF export
    const element = document.getElementById('resume-content');
    if (!element) {
        throw new Error('Resume content not found');
    }

    // Dynamic import of html2pdf (works with Next.js)
    const html2pdf = (await import('html2pdf.js')).default;
    
    const opt = {
        margin: 0.5,
        filename: `${resumeData.full_name || 'Resume'}_Resume.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false
        },
        jsPDF: { 
            unit: 'in', 
            format: 'letter', 
            orientation: 'portrait' 
        }
    };

    try {
        await html2pdf().set(opt).from(element).save();
    } catch (error) {
        console.error('PDF export error:', error);
        throw new Error('Failed to generate PDF. Please try again.');
    }
}

export function exportToWord(resumeData: ResumeData) {
    const htmlContent = generateHTML(resumeData);
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.full_name}_Resume.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function exportToHTML(resumeData: ResumeData) {
    const htmlContent = generateHTML(resumeData);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.full_name}_Resume.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export function exportToTXT(resumeData: ResumeData) {
    let text = `${resumeData.full_name}\n`;
    text += `${resumeData.email} | ${resumeData.phone} | ${resumeData.location}\n`;
    if (resumeData.linkedin) text += `LinkedIn: ${resumeData.linkedin}\n`;
    if (resumeData.website) text += `Website: ${resumeData.website}\n`;
    text += `\n${'='.repeat(50)}\n\n`;
    
    if (resumeData.summary) {
        text += `SUMMARY\n${'='.repeat(50)}\n${resumeData.summary}\n\n`;
    }
    
    if (resumeData.skills && resumeData.skills.length > 0) {
        text += `SKILLS\n${'='.repeat(50)}\n${resumeData.skills.join(', ')}\n\n`;
    }
    
    if (resumeData.experience && resumeData.experience.length > 0) {
        text += `EXPERIENCE\n${'='.repeat(50)}\n`;
        resumeData.experience.forEach((exp: any) => {
            text += `\n${exp.title} | ${exp.company}\n`;
            text += `${exp.start_date} - ${exp.end_date}\n`;
            if (exp.bullet_points) {
                exp.bullet_points.forEach((point: string) => {
                    text += `• ${point}\n`;
                });
            }
            text += '\n';
        });
    }
    
    if (resumeData.education && resumeData.education.length > 0) {
        text += `EDUCATION\n${'='.repeat(50)}\n`;
        resumeData.education.forEach((edu: any) => {
            text += `${edu.degree} | ${edu.school} | ${edu.graduation_year}\n`;
        });
    }

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${resumeData.full_name}_Resume.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function generateHTML(resumeData: ResumeData): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${resumeData.full_name} - Resume</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #1e293b; border-bottom: 2px solid #1e293b; padding-bottom: 10px; }
        h2 { color: #334155; margin-top: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; }
        .contact { margin: 10px 0; }
        .section { margin: 20px 0; }
        ul { list-style-type: disc; padding-left: 20px; }
        .experience-item { margin: 15px 0; }
    </style>
</head>
<body>
    <h1>${resumeData.full_name}</h1>
    <div class="contact">
        ${resumeData.email} | ${resumeData.phone} | ${resumeData.location}<br>
        ${resumeData.linkedin ? `LinkedIn: ${resumeData.linkedin}<br>` : ''}
        ${resumeData.website ? `Website: ${resumeData.website}` : ''}
    </div>
    
    ${resumeData.summary ? `<div class="section"><h2>Summary</h2><p>${resumeData.summary}</p></div>` : ''}
    
    ${resumeData.skills && resumeData.skills.length > 0 ? `
    <div class="section">
        <h2>Skills</h2>
        <p>${resumeData.skills.join(', ')}</p>
    </div>
    ` : ''}
    
    ${resumeData.experience && resumeData.experience.length > 0 ? `
    <div class="section">
        <h2>Experience</h2>
        ${resumeData.experience.map((exp: any) => `
            <div class="experience-item">
                <strong>${exp.title}</strong> | ${exp.company}<br>
                <em>${exp.start_date} - ${exp.end_date}</em>
                <ul>
                    ${exp.bullet_points ? exp.bullet_points.map((point: string) => `<li>${point}</li>`).join('') : ''}
                </ul>
            </div>
        `).join('')}
    </div>
    ` : ''}
    
    ${resumeData.education && resumeData.education.length > 0 ? `
    <div class="section">
        <h2>Education</h2>
        ${resumeData.education.map((edu: any) => `
            <p><strong>${edu.degree}</strong> | ${edu.school} | ${edu.graduation_year}</p>
        `).join('')}
    </div>
    ` : ''}
</body>
</html>
    `.trim();
}

