import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnChanges {
    constructor(private apiService: ApiService, private toastr: ToastrService) { }

    @Input() profileData: any;
    @Input() pageSize: number = 10;

    currentPage: number = 1;
    totalItems: number = 0;
    totalPages: number = 1;
    twitterUrl: string = '';
    repoData: any; // Data from Repo API
    pageOptions = [10, 50, 100];
    isOpen = false; // Boolean for Dropdown

    ngOnChanges(changes: SimpleChanges) {
        if (changes['profileData'] && this.profileData) {
            this.initComponent();
        }
    }

    initComponent() {
        this.getRepoData(this.profileData?.repos_url); // Calling for Default Page Size
        this.totalItems = this.profileData?.public_repos;
        this.calculateTotalPages();
        this.twitterUrl = `https://twitter.com/${this.profileData?.twitter_username}`;
    }

    calculateTotalPages() {
        this.totalPages = Math.ceil(this.totalItems / this.pageSize) || 1;
    }

    getRepoData(path: string) {
        this.apiService
            .getData(path + `?page=${this.currentPage}&per_page=${this.pageSize}`)
            .subscribe(
                (data: any) => {
                    this.repoData = data;
                    this.scrollToTop();
                },
                (error) => {
                    this.toastr.error('Unable to fetch user from Github!', 'Error Message');
                }
            );
    }

    nextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
            this.getRepoData(this.profileData.repos_url);
        }
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.getRepoData(this.profileData.repos_url);
        }
    }

    setPage(page: number) {
        if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
            this.currentPage = page;
            this.getRepoData(this.profileData.repos_url);
        }
    }

    setPageSize(size: number) {
        this.pageSize = size;
        this.currentPage = 1;
        this.calculateTotalPages();
        this.getRepoData(this.profileData.repos_url);
        this.handleDropDown();
    }

    handleDropDown() {
        this.isOpen = !this.isOpen;
    }

    scrollToTop() {
        const scrollElem: Element | null = document.querySelector('#user-details');
        scrollElem?.scrollIntoView({ behavior: 'smooth' });
    }

    get displayedPages(): number[] {
        const pages: number[] = [];
        pages.push(1);

        if (this.currentPage > 4) {
            pages.push(-1);
        }

        const start = Math.max(2, this.currentPage - 2);
        const end = Math.min(this.totalPages - 1, this.currentPage + 2);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (this.totalPages - this.currentPage > 3) {
            pages.push(-1);
        }

        if (this.totalPages > 1) {
            pages.push(this.totalPages);
        }

        return pages;
    }
}
