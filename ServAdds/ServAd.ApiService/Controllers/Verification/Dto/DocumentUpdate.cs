using ShareLibrary.cs.Data.Enums;

namespace ServAd.ApiService.Controllers.Verification.Dto
{
    
        public record DocumentUpdateDTO(
      
           DocumentType DocumentType,
           string DocumentNumber,
           IFormFile DocumentFrontSide,
          IFormFile DocumentBackSide

      
       );
    
}
