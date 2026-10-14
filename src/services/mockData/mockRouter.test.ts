import {resolveMockRequest} from './mockRouter';

describe('resolveMockRequest', () => {
  describe('GET /pages/home', () => {
    it('returns the bundled home page fixture with the shared program dataset merged in', () => {
      // Act
      const {status, data} = resolveMockRequest('GET', '/pages/home', undefined);

      // Assert
      expect(status).toBe(200);
      const body = data as {
        success: boolean;
        data: {program_list: unknown[]; program_category: unknown[]; home_banner: unknown[]};
      };
      expect(body.success).toBe(true);
      expect(body.data.program_list.length).toBeGreaterThan(0);
      expect(body.data.program_category.length).toBeGreaterThan(0);
      expect(body.data.home_banner.length).toBeGreaterThan(0);
    });
  });

  describe('GET /banners', () => {
    it('returns the banners fixture as an array', () => {
      // Act
      const {data} = resolveMockRequest('GET', '/banners', undefined);

      // Assert
      const body = data as {success: boolean; data: unknown[]};
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(true);
    });
  });

  describe('POST /auth/login', () => {
    it('succeeds with the seeded mock password', () => {
      // Act
      const {data} = resolveMockRequest('POST', '/auth/login', {password: 'password123'});

      // Assert
      const body = data as {success: boolean; data: {access_token: string}};
      expect(body.success).toBe(true);
      expect(body.data.access_token).toBe('mock-access-token-dev');
    });

    it('fails with a wrong password', () => {
      // Act
      const {data} = resolveMockRequest('POST', '/auth/login', {password: 'wrong'});

      // Assert
      const body = data as {success: boolean};
      expect(body.success).toBe(false);
    });
  });

  describe('GET /programs/link/:link', () => {
    it('returns full detail for a program that exists in the seed list', () => {
      // Act
      const {data} = resolveMockRequest('GET', '/programs/link/kafarat', undefined);

      // Assert
      const body = data as {success: boolean; data: {title: string; nominal_presets: unknown[]}};
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Tunaika');
      expect(body.data.nominal_presets.length).toBeGreaterThan(0);
    });

    it('falls back to a generated detail for an unknown link', () => {
      // Act
      const {data} = resolveMockRequest('GET', '/programs/link/some-unseeded-link', undefined);

      // Assert
      const body = data as {success: boolean; data: {link: string}};
      expect(body.success).toBe(true);
      expect(body.data.link).toBe('some-unseeded-link');
    });
  });

  describe('GET /organizations/:id', () => {
    it('returns the organization profile with a computed total_programs', () => {
      // Act
      const {data} = resolveMockRequest('GET', '/organizations/11', undefined);

      // Assert
      const body = data as {success: boolean; data: {name: string; total_programs: number}};
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Aksiberbagi');
      expect(body.data.total_programs).toBeGreaterThan(0);
    });

    it('reports failure for an unknown organization id', () => {
      // Act
      const {data} = resolveMockRequest('GET', '/organizations/999', undefined);

      // Assert
      const body = data as {success: boolean; data: unknown};
      expect(body.success).toBe(false);
      expect(body.data).toBeNull();
    });
  });

  describe('notifications', () => {
    it('marks a notification as read and reflects it in the unread count', () => {
      // Arrange
      const before = resolveMockRequest('GET', '/notifications/unread-count', undefined)
        .data as {data: number};

      // Act
      resolveMockRequest('POST', '/notifications/notif-1/read', undefined);
      const after = resolveMockRequest('GET', '/notifications/unread-count', undefined)
        .data as {data: number};

      // Assert
      expect(after.data).toBe(before.data - 1);
    });
  });

  describe('PATCH /users/me', () => {
    it('returns inline field errors for an invalid payload', () => {
      // Act
      const {data} = resolveMockRequest('PATCH', '/users/me', {name: '', email: 'not-an-email'});

      // Assert
      const body = data as {success: boolean; data: Record<string, string>};
      expect(body.success).toBe(false);
      expect(body.data.name).toBeTruthy();
      expect(body.data.email).toBeTruthy();
    });

    it('updates the mock user on a valid payload', () => {
      // Act
      const {data} = resolveMockRequest('PATCH', '/users/me', {
        name: 'Updated Name',
        email: 'updated@email.com',
      });

      // Assert
      const body = data as {success: boolean; data: {name: string; email: string}};
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Updated Name');

      const me = resolveMockRequest('GET', '/users/me', undefined).data as {
        data: {name: string};
      };
      expect(me.data.name).toBe('Updated Name');
    });
  });

  describe('POST /wallet/topup', () => {
    it('rejects an amount below the minimum', () => {
      // Act
      const {data} = resolveMockRequest('POST', '/wallet/topup', {
        amount: 1000,
        paymentMethodId: 'bank-bca',
      });

      // Assert
      expect((data as {success: boolean}).success).toBe(false);
    });

    it('computes the total amount including the admin fee', () => {
      // Act
      const {data} = resolveMockRequest('POST', '/wallet/topup', {
        amount: 50000,
        paymentMethodId: 'bank-bca',
      });

      // Assert
      const body = data as {success: boolean; data: {totalAmount: number; adminFee: number}};
      expect(body.success).toBe(true);
      expect(body.data.totalAmount).toBe(50000 + body.data.adminFee);
    });
  });

  describe('POST /vouchers/apply', () => {
    it('accepts a known voucher code case-insensitively', () => {
      // Act
      const {data} = resolveMockRequest('POST', '/vouchers/apply', {code: 'hemat10'});

      // Assert
      const body = data as {success: boolean; data: {code: string; discountAmount: number}};
      expect(body.success).toBe(true);
      expect(body.data.code).toBe('HEMAT10');
    });

    it('rejects an unknown voucher code', () => {
      // Act
      const {data} = resolveMockRequest('POST', '/vouchers/apply', {code: 'DOESNOTEXIST'});

      // Assert
      expect((data as {success: boolean}).success).toBe(false);
    });
  });

  describe('unmatched route', () => {
    it('returns a 404-shaped response instead of throwing', () => {
      // Act
      const result = resolveMockRequest('GET', '/this/route/does-not-exist', undefined);

      // Assert
      expect(result.status).toBe(404);
      expect((result.data as {success: boolean}).success).toBe(false);
    });
  });

  describe('Amalan Harian', () => {
    function todayIso(): string {
      const now = new Date();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      return `${now.getFullYear()}-${month}-${day}`;
    }

    type AmalanItem = {
      id: string;
      date: string;
      time: string;
      title: string;
      isCompleted: boolean;
      note: string | null;
    };
    type DayBody = {
      success: boolean;
      data: {summary: {done: number; total: number}; items: AmalanItem[]};
    };

    it('returns today items sorted by time together with the day summary', () => {
      // Act
      const {data} = resolveMockRequest('GET', `/amalan?date=${todayIso()}`, undefined);

      // Assert
      const body = data as DayBody;
      expect(body.success).toBe(true);
      expect(body.data.items.length).toBeGreaterThan(0);
      const times = body.data.items.map(item => item.time);
      expect([...times].sort()).toEqual(times);
      expect(body.data.summary.total).toBe(body.data.items.length);
      expect(body.data.summary.done).toBe(
        body.data.items.filter(item => item.isCompleted).length,
      );
    });

    it('returns one summary entry per day in the requested range', () => {
      // Arrange
      const end = todayIso();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6);
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const day = String(startDate.getDate()).padStart(2, '0');
      const start = `${startDate.getFullYear()}-${month}-${day}`;

      // Act
      const {data} = resolveMockRequest(
        'GET',
        `/amalan/summary?start=${start}&end=${end}`,
        undefined,
      );

      // Assert
      const body = data as {success: boolean; data: {date: string}[]};
      expect(body.success).toBe(true);
      expect(body.data).toHaveLength(7);
      expect(body.data[0]?.date).toBe(start);
      expect(body.data[6]?.date).toBe(end);
    });

    it('does not mistake /amalan/presets for an amalan id', () => {
      // Act
      const {data} = resolveMockRequest('GET', '/amalan/presets', undefined);

      // Assert
      const body = data as {success: boolean; data: {slug: string}[]};
      expect(body.success).toBe(true);
      expect(body.data.some(preset => preset.slug === 'sedekah')).toBe(true);
    });

    it('toggles completion and returns the refreshed summary', () => {
      // Arrange
      const date = todayIso();
      const before = (
        resolveMockRequest('GET', `/amalan?date=${date}`, undefined).data as DayBody
      ).data;
      const target = before.items.find(item => !item.isCompleted);

      // Act
      const {data} = resolveMockRequest(
        'POST',
        `/amalan/${target?.id}/complete`,
        undefined,
      );

      // Assert
      const body = data as {
        success: boolean;
        message: string;
        data: {item: AmalanItem; summary: {done: number; total: number}};
      };
      expect(body.success).toBe(true);
      expect(body.message).toBe('Amalan ditandai selesai');
      expect(body.data.item.isCompleted).toBe(true);
      expect(body.data.summary.done).toBe(before.summary.done + 1);

      // Cleanup — kembalikan ke keadaan semula supaya test lain tidak terpengaruh.
      resolveMockRequest('POST', `/amalan/${target?.id}/complete`, undefined);
    });

    it('rejects an invalid time and reports the error per field', () => {
      // Act
      const {data} = resolveMockRequest('POST', '/amalan', {
        date: todayIso(),
        presetSlug: 'sedekah',
        time: '25:00',
        note: null,
        reminderEnabled: false,
      });

      // Assert
      const body = data as {success: boolean; data: Record<string, string>};
      expect(body.success).toBe(false);
      expect(body.data.time).toBe('Format waktu tidak valid');
    });

    it('rejects an unknown preset', () => {
      // Act
      const {data} = resolveMockRequest('POST', '/amalan', {
        date: todayIso(),
        presetSlug: 'tidak-ada',
        time: '05:30',
        note: null,
        reminderEnabled: false,
      });

      // Assert
      const body = data as {success: boolean; data: Record<string, string>};
      expect(body.success).toBe(false);
      expect(body.data.presetSlug).toBe('Pilih jenis amalan');
    });

    it('creates, updates without clearing completion, then deletes an amalan', () => {
      // Arrange — buat amalan baru.
      const date = todayIso();
      const created = (
        resolveMockRequest('POST', '/amalan', {
          date,
          presetSlug: 'dzikir',
          time: '21:15',
          note: '  Dzikir malam  ',
          reminderEnabled: true,
        }).data as {success: boolean; data: AmalanItem}
      ).data;
      expect(created.title).toBe('Dzikir');
      expect(created.note).toBe('Dzikir malam');

      // Act — tandai selesai lalu ubah jamnya.
      resolveMockRequest('POST', `/amalan/${created.id}/complete`, undefined);
      const updated = (
        resolveMockRequest('PUT', `/amalan/${created.id}`, {
          date,
          presetSlug: 'dzikir',
          time: '21:45',
          note: null,
          reminderEnabled: false,
        }).data as {success: boolean; data: AmalanItem}
      ).data;

      // Assert — jam berubah, status selesai tidak ikut hilang.
      expect(updated.time).toBe('21:45');
      expect(updated.isCompleted).toBe(true);
      expect(updated.note).toBeNull();

      // Act — hapus.
      const deleted = resolveMockRequest(
        'DELETE',
        `/amalan/${created.id}`,
        undefined,
      ).data as {success: boolean; message: string};

      // Assert
      expect(deleted.success).toBe(true);
      expect(deleted.message).toBe('Amalan dihapus');
      const after = (
        resolveMockRequest('GET', `/amalan?date=${date}`, undefined).data as DayBody
      ).data;
      expect(after.items.some(item => item.id === created.id)).toBe(false);
    });

    it('answers success: false for an amalan that no longer exists', () => {
      // Act
      const {data} = resolveMockRequest(
        'POST',
        '/amalan/amalan-tidak-ada/complete',
        undefined,
      );

      // Assert
      const body = data as {success: boolean; message: string};
      expect(body.success).toBe(false);
      expect(body.message).toBe('Amalan tidak ditemukan');
    });
  });

  describe('GET /event', () => {
    it('returns a single event object, not a list', () => {
      // Act
      const {status, data} = resolveMockRequest('GET', '/event', undefined);

      // Assert
      expect(status).toBe(200);
      const body = data as {
        success: boolean;
        data: {id: string; posterUrl: string; registrationUrl: string} | null;
      };
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(false);
      expect(body.data?.registrationUrl).toBeTruthy();
    });
  });

  describe('GET /themes/active', () => {
    it('returns a single active theme with a cta target', () => {
      // Act
      const {status, data} = resolveMockRequest('GET', '/themes/active', undefined);

      // Assert
      expect(status).toBe(200);
      const body = data as {
        success: boolean;
        data: {ctaType: string; ctaTarget: string} | null;
      };
      expect(body.success).toBe(true);
      expect(Array.isArray(body.data)).toBe(false);
      expect(body.data?.ctaTarget).toBeTruthy();
      expect(['web', 'program']).toContain(body.data?.ctaType);
    });
  });
});
