import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { MarkdownModule } from 'ngx-markdown';

interface DocSection {
  title: string;
  file: string;
  content?: string;
  expanded?: boolean;
}

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [CommonModule, MarkdownModule],
  templateUrl: './docs.component.html',
  styleUrls: ['./docs.component.css']
})
export class DocsComponent implements OnInit {
  activeTab: string = 'README';
  loading: boolean = true;
  
  mainDocs: DocSection[] = [
    { title: 'Project Overview', file: 'README.md' },
    { title: 'Style Guide', file: 'README-STYLES.md' },
    { title: 'Architecture', file: 'ARCHITECTURE.md' }
  ];
  
  additionalDocs: DocSection[] = [
    { title: 'Development Guidelines', file: 'DEVELOPMENT_GUIDELINES.md' },
    { title: 'Requirements', file: 'REQUIREMENTS.md' },
    { title: 'Deployment', file: 'DEPLOYMENT.md' },
    { title: 'Email Management', file: 'EMAIL_MANAGEMENT.md' },
    { title: 'Documentation', file: 'DOCUMENTATION.md' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Load all documentation files
    this.loadAllDocs();
  }

  loadAllDocs(): void {
    this.loading = true;
    
    // Load main documents first
    const mainPromises = this.mainDocs.map(doc => 
      this.loadDoc(doc)
    );
    
    // Then load additional documents
    const additionalPromises = this.additionalDocs.map(doc => 
      this.loadDoc(doc)
    );
    
    // Wait for all documents to load
    Promise.all([...mainPromises, ...additionalPromises])
      .finally(() => {
        this.loading = false;
      });
  }

  loadDoc(doc: DocSection): Promise<void> {
    return new Promise((resolve) => {
      this.http.get(`/assets/docs/${doc.file}`, { responseType: 'text' })
        .subscribe({
          next: (content) => {
            doc.content = content;
            resolve();
          },
          error: (err) => {
            console.error(`Error loading ${doc.file}:`, err);
            doc.content = `*Error loading ${doc.file}*`;
            resolve();
          }
        });
    });
  }

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  toggleExpand(doc: DocSection): void {
    doc.expanded = !doc.expanded;
  }

  isTabActive(tabName: string): boolean {
    return this.activeTab === tabName;
  }
} 