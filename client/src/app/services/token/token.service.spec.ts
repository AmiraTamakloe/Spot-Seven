import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

describe('TokenService', () => {
    let service: TokenService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [TokenService],
            imports: [HttpClientTestingModule],
        });

        spyOn(window, 'setInterval');
        service = TestBed.inject(TokenService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
