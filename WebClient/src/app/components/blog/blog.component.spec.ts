import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BlogComponent } from './blog.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('BlogComponent', () => {
  let component: BlogComponent;
  let fixture: ComponentFixture<BlogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogComponent, RouterTestingModule]
    }).compileComponents();
    
    fixture = TestBed.createComponent(BlogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a blog heading', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Blog');
  });

  it('should display blog posts', () => {
    const compiled = fixture.nativeElement;
    const blogPosts = compiled.querySelectorAll('.blog-post');
    expect(blogPosts.length).toBeGreaterThan(0);
  });
}); 